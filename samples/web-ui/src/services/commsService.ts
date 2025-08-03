// Chat Service - Wrapper around Socket SDK for chat functionality
import { SocketSDK } from '@99xio/xians-sdk-typescript';
import { MessageType } from '@99xio/xians-sdk-typescript';
import type { Message, EventHandlers } from '@99xio/xians-sdk-typescript';
import { getSDKConfig } from '../config/sdk';
import type { Agent, ChatMessage } from '../types';

export interface CommsServiceOptions {
  onMessageReceived?: (message: ChatMessage) => void;
  onConnectionStateChanged?: (connected: boolean) => void;
  onError?: (error: string) => void;
  onDataMessageReceived?: (message: Message) => void;
  onChatRequestSent?: (requestId: string) => void;
  onChatResponseReceived?: (requestId: string) => void;
  participantId?: string;
  documentId?: string;
}

export class CommsService {
  private socketSDK: SocketSDK;
  private currentAgent: Agent | null = null;
  private options: CommsServiceOptions;
  private messageCounter = 0;
  private isLoadingHistory = false;
  private processedHistoryHashes = new Set<string>();
  private historyLoadedForAgent: string | null = null;

  // Expose current agent for external checks (read-only)
  getCurrentAgent(): Agent | null {
    return this.currentAgent;
  }

  // Update document ID for the service (used when navigating between documents)
  updateDocumentId(documentId?: string): void {
    console.log(`[ChatService] Updating document ID from ${this.options.documentId} to ${documentId}`);
    this.options.documentId = documentId;
    console.log(`[ChatService] 🔍 Document ID updated - current options.documentId: ${this.options.documentId}`);
    // Reset history loading state when document changes
    this.historyLoadedForAgent = null;
    this.processedHistoryHashes.clear();
  }

  constructor(options: CommsServiceOptions = {}) {
    this.options = options;
    
    const config = getSDKConfig();
    
    const eventHandlers: EventHandlers = {
      onReceiveChat: this.handleChatMessage.bind(this),
      onReceiveData: this.handleDataMessage.bind(this),
      onReceiveHandoff: this.handleHandoffMessage.bind(this),
      onThreadHistory: this.handleThreadHistory.bind(this),
      onConnected: this.handleConnected.bind(this),
      onDisconnected: this.handleDisconnected.bind(this),
      onConnectionError: this.handleConnectionError.bind(this),
      onError: this.handleError.bind(this),
    };

    this.socketSDK = new SocketSDK({
      tenantId: config.tenantId,
      apiKey: config.apiKey,
      serverUrl: config.serverUrl,
      autoReconnect: true,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      eventHandlers,
      logger: (message: string) => console.log(`[ChatService] ${message}`),
    });
  }

  async connect(): Promise<void> {
    console.log('[ChatService] Attempting to connect...');
    await this.socketSDK.connect();
    
    // Manually check connection state since onConnected might not be called
    setTimeout(() => {
      const isConnected = this.socketSDK.isConnected();
      console.log('[ChatService] Manual connection check:', isConnected);
      if (isConnected) {
        this.handleConnected();
      }
    }, 1000); // Give it a moment to establish connection
  }

  async disconnect(): Promise<void> {
    await this.socketSDK.disconnect();
  }

  isConnected(): boolean {
    return this.socketSDK.isConnected();
  }

  async setCurrentAgent(agent: Agent): Promise<void> {
    // Prevent duplicate agent setup
    if (this.currentAgent && this.currentAgent.workflow === agent.workflow) {
      console.log(`[ChatService] Agent ${agent.name} already set, skipping duplicate setup`);
      return;
    }

    // Unsubscribe from previous agent if any
    if (this.currentAgent && this.isConnected()) {
      console.log(`[ChatService] Unsubscribing from previous agent: ${this.currentAgent.name}`);
      await this.socketSDK.unsubscribeFromAgent(
        this.currentAgent.workflow,
        this.getParticipantId()
      );
    }

    console.log(`[ChatService] Setting current agent to: ${agent.name}`);
    
    // Clear processed history when switching agents to allow fresh history loading
    this.processedHistoryHashes.clear();
    this.historyLoadedForAgent = null; // Reset to allow loading for new agent
    this.currentAgent = agent;

    // Subscribe to new agent if connected
    if (this.isConnected()) {
      console.log(`[ChatService] Subscribing to agent: ${agent.name}`);
      await this.socketSDK.subscribeToAgent(
        agent.workflow,
        this.getParticipantId()
      );
      
      // Load conversation history with retry mechanism for URL route access
      await this.loadConversationHistory(agent);
    }
  }

  private async loadConversationHistory(agent: Agent, retryCount = 0): Promise<void> {
    // Check if history already loaded for this agent
    if (this.historyLoadedForAgent === agent.workflow) {
      console.log(`[ChatService] ✅ History already loaded for ${agent.name}, skipping duplicate request`);
      return;
    }

    // Prevent concurrent history loading
    if (this.isLoadingHistory) {
      console.log(`[ChatService] ⏸️  History loading already in progress for ${agent.name}, skipping duplicate request`);
      return;
    }

    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      this.isLoadingHistory = true;
      console.log(`[ChatService] Loading conversation history for participant: ${this.getParticipantId()}`);
      
      // Ensure scope parameter is never undefined (which might be dropped by SDK)
      const scope = this.options.documentId || undefined;
      console.log(`[ChatService] 🔍 GetThreadHistory call - workflow: ${agent.workflow}, participant: ${this.getParticipantId()}, scope: ${scope}`);
      
      // Load conversation history - increased page size for better initial load
      await this.socketSDK.getThreadHistory(
        agent.workflow,
        this.getParticipantId(),
        1,
        20,
        scope
      );
      
      console.log(`[ChatService] ✅ History loaded successfully for ${agent.name}`);
      this.historyLoadedForAgent = agent.workflow;
    } catch (error) {
      console.error(`[ChatService] ❌ Failed to load history (attempt ${retryCount + 1}):`, error);
      
      // Retry loading history if it fails (important for URL route access)
      if (retryCount < maxRetries) {
        console.log(`[ChatService] Retrying history load in ${retryDelay}ms...`);
        setTimeout(() => {
          this.isLoadingHistory = false; // Reset flag before retry
          this.loadConversationHistory(agent, retryCount + 1);
        }, retryDelay);
        return; // Don't reset flag yet, will be reset in retry
      } else {
        console.error(`[ChatService] 🚨 Failed to load history after ${maxRetries} attempts`);
        this.options.onError?.('Failed to load conversation history');
      }
    } finally {
      this.isLoadingHistory = false;
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.currentAgent) {
      throw new Error('No agent selected');
    }

    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }

    const requestId = `msg-${Date.now()}-${++this.messageCounter}`;
    const message = {
      requestId,
      participantId: this.getParticipantId(),
      workflow: this.currentAgent.workflow,
      type: 'Chat' as const,
      scope: this.options.documentId,
      text,
      data: this.getMessageData(),
    };

    // Notify that a chat request was sent
    this.options.onChatRequestSent?.(requestId);

    await this.socketSDK.sendInboundMessage(message, MessageType.Chat);
  }

  async sendData(data: Record<string, unknown>): Promise<void> {
    if (!this.currentAgent) {
      throw new Error('No agent selected');
    }

    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }

    const message = {
      requestId: `data-${Date.now()}-${++this.messageCounter}`,
      participantId: this.getParticipantId(),
      workflow: this.currentAgent.workflow,
      type: 'Data' as const,
      scope: this.options.documentId,
      data: {
        ...data,
        ...this.getMessageData(),
      },
    };

    await this.socketSDK.sendInboundMessage(message, MessageType.Data);
  }

  private getParticipantId(): string {
    return this.options.participantId || getSDKConfig().participantId;
  }

  private getMessageData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    if (this.options.documentId) {
      data.documentId = this.options.documentId;
    }
    return data;
  }

  private handleChatMessage(message: Message): void {
    // Check if this is a Chat response with a requestId
    if (message.requestId && message.messageType === 'Chat') {
      this.options.onChatResponseReceived?.(message.requestId);
    }
    
    const chatMessage = this.convertToChatMessage(message, 'agent');
    if (chatMessage.content === '') {
      return;
    }
    this.options.onMessageReceived?.(chatMessage);
  }

  private handleDataMessage(message: Message): void {
    console.log('[ChatService] Data message received:', message.id, message.data);
    
    // Notify subscribers about the data message
    this.options.onDataMessageReceived?.(message);
  }

  private handleHandoffMessage(message: Message): void {
    const displayText = message.text || 'Handoff request processed';
    const chatMessage = this.convertToChatMessage(
      { ...message, text: displayText }, 
      'agent'
    );
    this.options.onMessageReceived?.(chatMessage);
  }

  private handleThreadHistory(history: Message[]): void {
    if (history.length === 0) {
      console.log('[ChatService] No conversation history found');
      return;
    }

    // Create a hash of the history to detect duplicates
    const historyIds = history.map(m => m.id).sort().join(',');
    const historyHash = `${history.length}-${historyIds}`;
    
    if (this.processedHistoryHashes.has(historyHash)) {
      console.log(`[ChatService] 🔄 Skipping duplicate history batch (${history.length} messages)`);
      return;
    }
    
    this.processedHistoryHashes.add(historyHash);
    console.log(`[ChatService] Processing ${history.length} history messages`);
    
    // Filter out Data type messages from history
    // Data messages typically have data but minimal or no text content
    const filteredHistory = history.filter(message => {
      if (message.messageType === MessageType.Data) {
        return false;
      }
      return true; // Keep all other messages
    });
    
    if (filteredHistory.length < history.length) {
      console.log(`[ChatService] Filtered out ${history.length - filteredHistory.length} Data messages from history`);
    }
    
    // Sort messages by creation date to ensure proper chronological order
    const sortedHistory = [...filteredHistory].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });

    // Convert history messages and send them in chronological order
    // Mark them as history messages so UI can handle duplicates
    sortedHistory.forEach((message, index) => {
      const sender = message.direction === 'Incoming' ? 'user' : 'agent';
      const chatMessage = this.convertToChatMessage(message, sender);
      chatMessage.metadata = {
        ...chatMessage.metadata,
        isHistoryMessage: true
      };
      
      // Add a small delay between messages to prevent UI flooding
      setTimeout(() => {
        this.options.onMessageReceived?.(chatMessage);
      }, index * 10); // 10ms delay between each message
    });

    console.log(`[ChatService] ✅ Loaded ${sortedHistory.length} messages from conversation history (${history.length - filteredHistory.length} Data messages filtered out)`);
  }

  private convertToChatMessage(message: Message, sender: 'user' | 'agent'): ChatMessage {
    return {
      id: message.id || `msg-${Date.now()}-${Math.random()}`,
      content: message.text || '',
      sender,
      timestamp: message.createdAt ? new Date(message.createdAt) : new Date(),
      type: 'text',
      metadata: {
        socketMessage: message,
        workflow: message.workflowType,
      },
    };
  }

  private handleConnected(): void {
    console.log('[ChatService] ✅ Connected to server - updating UI state');
    this.options.onConnectionStateChanged?.(true);
    
    // Note: Don't re-subscribe here as it will be handled by ChatPanel's useEffect
    // This prevents double subscription and duplicate history loading
  }

  private handleDisconnected(reason?: string): void {
    console.log(`[ChatService] ❌ Disconnected: ${reason}`);
    this.options.onConnectionStateChanged?.(false);
  }

  private handleConnectionError(error: { statusCode: number; message: string }): void {
    console.error('[ChatService] 🚨 Connection error:', error);
    this.options.onError?.(`Connection error: ${error.message}`);
  }

  private handleError(error: string): void {
    console.error('[ChatService] 🚨 Error:', error);
    this.options.onError?.(error);
  }

  async dispose(): Promise<void> {
    // Reset any loading state
    this.isLoadingHistory = false;
    this.currentAgent = null;
    this.processedHistoryHashes.clear();
    this.historyLoadedForAgent = null;
    
    await this.socketSDK.dispose();
  }
}