// Flow Service - Dedicated service for flow subscriptions and sending data messages to specified flows
import { SocketSDK } from '@99xio/xians-sdk-typescript';
import { MessageType } from '@99xio/xians-sdk-typescript';
import type { Message, EventHandlers } from '@99xio/xians-sdk-typescript';
import { getSDKConfig } from '../config/sdk';

export interface FlowServiceOptions {
  onDataMessageReceived?: (message: Message) => void;
  onConnectionStateChanged?: (connected: boolean) => void;
  onError?: (error: string) => void;
  participantId?: string;
  documentId?: string;
}

export interface DataMessagePayload {
  text?: string;
  data?: Record<string, unknown>;
  scope?: string;
}

export class FlowService {
  private socketSDK: SocketSDK;
  private options: FlowServiceOptions;
  private messageCounter = 0;
  private isConnected = false;
  private currentFlowId: string | null = null;

  constructor(options: FlowServiceOptions = {}) {
    this.options = options;
    
    const config = getSDKConfig();
    
    const eventHandlers: EventHandlers = {
      onReceiveChat: () => {}, // Not needed for flow service
      onReceiveData: this.handleDataMessage.bind(this),
      onReceiveHandoff: () => {}, // Not needed for flow service
      onThreadHistory: () => {}, // Not needed for flow service
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
      logger: (message: string) => console.log(`[FlowService] ${message}`),
    });
  }

  async connect(): Promise<void> {
    console.log('[FlowService] Attempting to connect...');
    await this.socketSDK.connect();
    
    // Manual connection check
    setTimeout(() => {
      const isConnected = this.socketSDK.isConnected();
      console.log('[FlowService] Manual connection check:', isConnected);
      if (isConnected) {
        this.handleConnected();
      }
    }, 1000);
  }

  async disconnect(): Promise<void> {
    await this.socketSDK.disconnect();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Send a data message to the specified flow
   * @param flowId - The flow identifier to send the message to
   * @param payload - The message payload containing text and/or data
   */
  async sendDataMessage(flowId: string, text: string, data: object): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    if (!flowId) {
      throw new Error('Flow ID is required');
    }

    if (!text && !data) {
      throw new Error('Either text or data must be provided');
    }

    const requestId = `data-${Date.now()}-${++this.messageCounter}`;
    const message = {
      requestId,
      participantId: this.getParticipantId(),
      workflow: flowId,
      type: 'Data' as const,
      scope: this.options.documentId,
      text,
      data,
    };

    console.log(`[FlowService] Sending data message to flow: ${flowId}`, message);
    await this.socketSDK.sendInboundMessage(message, MessageType.Data);
  }

  /**
   * Subscribe to an agent's flow for receiving data messages
   * @param flowId - The flow identifier to subscribe to
   */
  async subscribeToFlow(flowId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    if (!flowId) {
      throw new Error('Flow ID is required');
    }

    // Unsubscribe from previous flow if different
    if (this.currentFlowId && this.currentFlowId !== flowId) {
      console.log(`[FlowService] Unsubscribing from previous flow: ${this.currentFlowId}`);
      await this.socketSDK.unsubscribeFromAgent(
        this.currentFlowId,
        this.getParticipantId()
      );
    }

    // Skip if already subscribed to the same flow
    if (this.currentFlowId === flowId) {
      console.log(`[FlowService] Already subscribed to flow: ${flowId}`);
      return;
    }

    console.log(`[FlowService] Subscribing to flow: ${flowId}`);
    try {
      await this.socketSDK.subscribeToAgent(
        flowId,
        this.getParticipantId()
      );
      this.currentFlowId = flowId;
      console.log(`✅ [FlowService] Successfully subscribed to flow: ${flowId}`);
    } catch (error) {
      console.error(`❌ [FlowService] Failed to subscribe to flow: ${flowId}`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from current flow
   */
  async unsubscribeFromCurrentFlow(): Promise<void> {
    if (this.currentFlowId && this.isConnected) {
      console.log(`[FlowService] Unsubscribing from current flow: ${this.currentFlowId}`);
      try {
        await this.socketSDK.unsubscribeFromAgent(
          this.currentFlowId,
          this.getParticipantId()
        );
        console.log(`✅ [FlowService] Successfully unsubscribed from flow: ${this.currentFlowId}`);
      } catch (error) {
        console.error(`❌ [FlowService] Failed to unsubscribe from flow: ${this.currentFlowId}`, error);
      }
      this.currentFlowId = null;
    }
  }

  /**
   * Get the currently subscribed flow ID
   */
  getCurrentFlowId(): string | null {
    return this.currentFlowId;
  }

  /**
   * Update the document ID for message context
   * @param documentId - The document ID to use as context
   */
  updateDocumentId(documentId?: string): void {
    console.log(`[FlowService] Updating document ID to: ${documentId}`);
    this.options.documentId = documentId;
  }

  private getParticipantId(): string {
    return this.options.participantId || getSDKConfig().participantId;
  }

  private handleDataMessage(message: Message): void {
    console.log('[FlowService] Data message received:', message.id, message.data);
    this.options.onDataMessageReceived?.(message);
  }

  private handleConnected(): void {
    console.log('[FlowService] ✅ Connected to server');
    this.isConnected = true;
    this.options.onConnectionStateChanged?.(true);
  }

  private handleDisconnected(reason?: string): void {
    console.log(`[FlowService] ❌ Disconnected: ${reason}`);
    this.isConnected = false;
    this.options.onConnectionStateChanged?.(false);
  }

  private handleConnectionError(error: { statusCode: number; message: string }): void {
    console.error('[FlowService] 🚨 Connection error:', error);
    this.options.onError?.(`Connection error: ${error.message}`);
  }

  private handleError(error: string): void {
    console.error('[FlowService] 🚨 Error:', error);
    this.options.onError?.(error);
  }

  async dispose(): Promise<void> {
    // Unsubscribe from current flow before disposing
    await this.unsubscribeFromCurrentFlow();
    
    this.isConnected = false;
    this.currentFlowId = null;
    await this.socketSDK.dispose();
  }
}

// Export a singleton instance for convenience
export const flowService = new FlowService();