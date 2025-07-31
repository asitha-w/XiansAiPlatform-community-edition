// Chat Service - Wrapper around Socket SDK for chat functionality
import { SocketSDK } from '@99xio/xians-sdk-typescript';
import { MessageType } from '@99xio/xians-sdk-typescript';
import type { Message, EventHandlers } from '@99xio/xians-sdk-typescript';
import { getSDKConfig } from '../config/sdk';
import type { Agent, ChatMessage } from '../types';

export interface ChatServiceOptions {
  onMessageReceived?: (message: ChatMessage) => void;
  onConnectionStateChanged?: (connected: boolean) => void;
  onError?: (error: string) => void;
  participantId?: string;
  documentId?: string;
}

export class ChatService {
  private socketSDK: SocketSDK;
  private currentAgent: Agent | null = null;
  private options: ChatServiceOptions;
  private messageCounter = 0;

  constructor(options: ChatServiceOptions = {}) {
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
    // Unsubscribe from previous agent if any
    if (this.currentAgent && this.isConnected()) {
      await this.socketSDK.unsubscribeFromAgent(
        this.currentAgent.workflow,
        this.getParticipantId()
      );
    }

    this.currentAgent = agent;

    // Subscribe to new agent if connected
    if (this.isConnected()) {
      await this.socketSDK.subscribeToAgent(
        agent.workflow,
        this.getParticipantId()
      );
      
      // Load conversation history with retry mechanism for URL route access
      await this.loadConversationHistory(agent);
    }
  }

  private async loadConversationHistory(agent: Agent, retryCount = 0): Promise<void> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      console.log(`[ChatService] Loading conversation history for participant: ${this.getParticipantId()}`);
      
      // Load conversation history - increased page size for better initial load
      await this.socketSDK.getThreadHistory(
        agent.workflow,
        this.getParticipantId(),
        1,
        20 // Load more messages initially
      );
      
      console.log(`[ChatService] ✅ History loaded successfully for ${agent.name}`);
    } catch (error) {
      console.error(`[ChatService] ❌ Failed to load history (attempt ${retryCount + 1}):`, error);
      
      // Retry loading history if it fails (important for URL route access)
      if (retryCount < maxRetries) {
        console.log(`[ChatService] Retrying history load in ${retryDelay}ms...`);
        setTimeout(() => {
          this.loadConversationHistory(agent, retryCount + 1);
        }, retryDelay);
      } else {
        console.error(`[ChatService] 🚨 Failed to load history after ${maxRetries} attempts`);
        this.options.onError?.('Failed to load conversation history');
      }
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.currentAgent) {
      throw new Error('No agent selected');
    }

    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }

    const message = {
      requestId: `msg-${Date.now()}-${++this.messageCounter}`,
      participantId: this.getParticipantId(),
      workflow: this.currentAgent.workflow,
      type: 'Chat' as const,
      text,
      data: this.getMessageData(),
    };

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
    const chatMessage = this.convertToChatMessage(message, 'agent');
    this.options.onMessageReceived?.(chatMessage);
  }

  private handleDataMessage(message: Message): void {
    // Convert data messages to chat format for display
    const displayText = `Data received: ${JSON.stringify(message.data, null, 2)}`;
    const chatMessage = this.convertToChatMessage(
      { ...message, text: displayText }, 
      'agent'
    );
    this.options.onMessageReceived?.(chatMessage);
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

    console.log(`[ChatService] Processing ${history.length} history messages`);
    
    // Sort messages by creation date to ensure proper chronological order
    const sortedHistory = [...history].sort((a, b) => {
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

    console.log(`[ChatService] ✅ Loaded ${sortedHistory.length} messages from conversation history`);
  }

  private convertToChatMessage(message: Message, sender: 'user' | 'agent'): ChatMessage {
    return {
      id: message.id || `msg-${Date.now()}-${Math.random()}`,
      content: message.text || 'No content',
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
    await this.socketSDK.dispose();
  }
}