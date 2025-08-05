// Bot Service - Wrapper around Socket SDK for bot subscriptions and chat functionality
import { SocketSDK } from '@99xio/xians-sdk-typescript';
import { MessageType } from '@99xio/xians-sdk-typescript';
import type { Message, EventHandlers } from '@99xio/xians-sdk-typescript';
import { getSDKConfig } from '../config/sdk';
import type { Bot, ChatMessage } from '../types';
import { getCurrentAgentGlobal } from '../utils/agentUtils';
import { getCurrentDocumentIdGlobal } from '../utils/documentUtils';

export interface BotServiceOptions {
  onMessageReceived?: (message: ChatMessage) => void;
  onConnectionStateChanged?: (connected: boolean) => void;
  onError?: (error: string) => void;
  onDataMessageReceived?: (message: Message) => void;
  onChatRequestSent?: (requestId: string) => void;
  onChatResponseReceived?: (requestId: string) => void;
  participantId?: string;
  /** Optional document ID override. If not provided, will automatically use document ID from URL context */
  documentId?: string;
}

export class BotService {
  private socketSDK: SocketSDK;
  private options: BotServiceOptions;
  private messageCounter = 0;
  private isLoadingHistory = false;
  private processedHistoryHashes = new Set<string>();
  private historyLoadedForAgent: string | null = null;

  // Expose current agent for external checks (read-only)
  getCurrentAgent(): Bot | null {
    return getCurrentAgentGlobal();
  }

  // Get current document ID from manual override or global context
  getCurrentDocumentId(): string | undefined {
    return this.options.documentId || getCurrentDocumentIdGlobal() || undefined;
  }

  /**
   * Manually override the document ID (optional - will use URL context by default)
   * @param documentId - Document ID to override, or undefined to use URL context
   */
  updateDocumentId(documentId?: string): void {
    const previousDocumentId = this.getCurrentDocumentId();
    this.options.documentId = documentId;
    const newDocumentId = this.getCurrentDocumentId();
    
    // Reset state if document changed to force fresh history loading
    if (previousDocumentId !== newDocumentId) {
      console.log(`[BotService] Document changed: ${previousDocumentId} -> ${newDocumentId}`);
      this.historyLoadedForAgent = null;
      this.processedHistoryHashes.clear();
      this.isLoadingHistory = false;
    }
  }

  constructor(options: BotServiceOptions = {}) {
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
      logger: (message: string) => console.log(`[BotService] ${message}`),
    });
  }

  async connect(): Promise<void> {
    console.log('[BotService] Attempting to connect...');
    await this.socketSDK.connect();
    
    // Manually check connection state since onConnected might not be called
    setTimeout(() => {
      const isConnected = this.socketSDK.isConnected();
      console.log('[BotService] Manual connection check:', isConnected);
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

  async subscribeToCurrentAgent(): Promise<void> {
    const agent = getCurrentAgentGlobal();
    if (!agent) {
      console.log(`[BotService] No current agent available`);
      return;
    }

    // Skip if already subscribed to this agent and document
    if (this.historyLoadedForAgent === agent.bot) {
      console.log(`[BotService] Already subscribed to ${agent.name}`);
      return;
    }

    // Unsubscribe from previous agent if different
    if (this.historyLoadedForAgent && this.isConnected()) {
      console.log(`[BotService] Unsubscribing from previous agent`);
      await this.socketSDK.unsubscribeFromAgent(
        this.historyLoadedForAgent,
        this.getParticipantId()
      );
    }

    // Reset state for new subscription
    this.processedHistoryHashes.clear();
    this.isLoadingHistory = false;

    // Subscribe to current agent
    if (this.isConnected()) {
      console.log(`[BotService] Subscribing to ${agent.name}`);
      
      try {
        await this.socketSDK.subscribeToAgent(
          agent.bot,
          this.getParticipantId()
        );
        console.log(`✅ [BotService] Subscribed to ${agent.bot}`);
        
        // Load conversation history
        await this.loadConversationHistory(agent);
      } catch (error) {
        console.error(`❌ [BotService] Failed to subscribe to ${agent.name}`, error);
        throw error;
      }
    }
  }

  private async loadConversationHistory(agent: Bot): Promise<void> {
    if (this.historyLoadedForAgent === agent.bot || this.isLoadingHistory) {
      return;
    }

    try {
      this.isLoadingHistory = true;
      console.log(`[BotService] Loading history for ${agent.name}`);
      
      await this.socketSDK.getThreadHistory(
        agent.bot,
        this.getParticipantId(),
        1,
        20,
        this.getCurrentDocumentId()
      );
      
      this.historyLoadedForAgent = agent.bot;
      console.log(`[BotService] ✅ History loaded for ${agent.name}`);
    } catch (error) {
      console.error(`[BotService] Failed to load history for ${agent.name}:`, error);
      this.options.onError?.('Failed to load conversation history');
    } finally {
      this.isLoadingHistory = false;
    }
  }

  async sendMessage(text: string): Promise<void> {
    const currentAgent = getCurrentAgentGlobal();
    if (!currentAgent) {
      throw new Error('No agent selected');
    }

    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }

    const requestId = `msg-${Date.now()}-${++this.messageCounter}`;
    const message = {
      requestId,
      participantId: this.getParticipantId(),
      workflow: currentAgent.bot,
      type: 'Chat' as const,
      scope: this.getCurrentDocumentId(),
      text,
      data: this.getMessageData(),
    };

    // Notify that a chat request was sent
    this.options.onChatRequestSent?.(requestId);

    await this.socketSDK.sendInboundMessage(message, MessageType.Chat);
  }

  async sendData(data: Record<string, unknown>): Promise<void> {
    const currentAgent = getCurrentAgentGlobal();
    if (!currentAgent) {
      throw new Error('No agent selected');
    }

    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }

    const message = {
      requestId: `data-${Date.now()}-${++this.messageCounter}`,
      participantId: this.getParticipantId(),
      workflow: currentAgent.bot,
      type: 'Data' as const,
      scope: this.getCurrentDocumentId(),
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
    
    const documentId = this.getCurrentDocumentId();
    if (documentId) {
      data.documentId = documentId;
    }
    return data;
  }

  private handleChatMessage(message: Message): void {
    const currentDocumentId = this.getCurrentDocumentId();
    if(message.scope !== currentDocumentId) {
      return;
    }
    
    // Check if this is a Chat response with a requestId
    if (message.requestId && message.messageType === 'Chat') {
      this.options.onChatResponseReceived?.(message.requestId);
    }
    
    const chatMessage = this.convertToChatMessage(message, 'agent');
    if (chatMessage.content) {
      this.options.onMessageReceived?.(chatMessage);
    }
  }

  private handleDataMessage(message: Message): void {
    const currentDocumentId = this.getCurrentDocumentId();
    if(message.scope !== currentDocumentId) {
      return;
    }
    
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
    if (history.length === 0) return;

    // Prevent duplicate processing
    const historyHash = history.map(m => m.id).sort().join(',');
    if (this.processedHistoryHashes.has(historyHash)) {
      return;
    }
    this.processedHistoryHashes.add(historyHash);
    
    // Filter out Data messages and sort chronologically
    const chatHistory = history
      .filter(message => message.messageType !== MessageType.Data)
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    // Send history messages to UI
    chatHistory.forEach((message, index) => {
      const sender = message.direction === 'Incoming' ? 'user' : 'agent';
      const chatMessage = this.convertToChatMessage(message, sender);
      chatMessage.metadata = {
        ...chatMessage.metadata,
        isHistoryMessage: true
      };
      
      // Small delay to prevent UI flooding
      setTimeout(() => {
        this.options.onMessageReceived?.(chatMessage);
      }, index * 10);
    });
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
    console.log('[BotService] ✅ Connected to server');
    this.options.onConnectionStateChanged?.(true);
  }

  private handleDisconnected(reason?: string): void {
    console.log(`[BotService] ❌ Disconnected: ${reason}`);
    this.options.onConnectionStateChanged?.(false);
  }

  private handleConnectionError(error: { statusCode: number; message: string }): void {
    console.error('[BotService] 🚨 Connection error:', error);
    this.options.onError?.(`Connection error: ${error.message}`);
  }

  private handleError(error: string): void {
    console.error('[BotService] 🚨 Error:', error);
    this.options.onError?.(error);
  }

  async dispose(): Promise<void> {
    // Reset any loading state
    this.isLoadingHistory = false;
    this.processedHistoryHashes.clear();
    this.historyLoadedForAgent = null;
    
    await this.socketSDK.dispose();
  }
}