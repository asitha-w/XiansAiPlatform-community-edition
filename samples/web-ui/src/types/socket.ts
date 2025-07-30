// Socket SDK Types
export interface SocketMessage {
  requestId: string;
  participantId: string;
  workflow: string;
  type: 'Chat' | 'Data' | 'Handoff';
  text?: string;
  data?: Record<string, unknown>;
}

export enum MessageType {
  Chat = 'Chat',
  Data = 'Data',
  Handoff = 'Handoff'
}

export enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnecting = 'Disconnecting',
  Reconnecting = 'Reconnecting',
  Failed = 'Failed'
}

export interface Message {
  id?: string;
  text?: string;
  data?: Record<string, unknown>;
  direction?: 'Incoming' | 'Outgoing';
  createdAt?: string;
  participantId?: string;
  workflowType?: string;
}

export interface EventHandlers {
  onReceiveChat?: (message: Message) => void;
  onReceiveData?: (message: Message) => void;
  onReceiveHandoff?: (message: Message) => void;
  onThreadHistory?: (history: Message[]) => void;
  onInboundProcessed?: (threadId: string) => void;
  onConnected?: () => void;
  onDisconnected?: (reason?: string) => void;
  onReconnecting?: (reason?: string) => void;
  onReconnected?: (connectionId?: string) => void;
  onConnectionError?: (error: { statusCode: number; message: string }) => void;
  onConnectionStateChanged?: (oldState: ConnectionState, newState: ConnectionState) => void;
  onError?: (error: string) => void;
}

export interface SocketSDKOptions {
  tenantId: string;
  apiKey?: string;
  jwtToken?: string;
  getJwtToken?: () => Promise<string>;
  serverUrl: string;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  connectionTimeout?: number;
  eventHandlers?: EventHandlers;
  logger?: (message: string) => void;
}