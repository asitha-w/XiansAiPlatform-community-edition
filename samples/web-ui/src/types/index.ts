// Core types for AI Studio application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  capabilities: string[];
  workflow: string;
  slug: string;
  mainComponent?: React.ComponentType;
}

export interface ContractEntity {
  id: string;
  type: ContractEntityType;
  title: string;
  status: string;
  data: ContractEntityData;
  lastModified: Date;
  assignedTo?: string;
}

export interface ContractEntityData {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  orderDetails?: {
    orderDate: string;
    dueDate: string;
    currency: string;
    total: number;
    taxAmount: number;
    subtotal: number;
  };
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes?: string;
}

export type ContractEntityType = 
  | 'order'
  | 'customer'
  | 'invoice'
  | 'product'
  | 'contract';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type: 'text' | 'file' | 'action';
  metadata?: Record<string, unknown>;
}

export interface Chat {
  id: string;
  agentId: string;
  userId: string;
  contractEntityId?: string;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRecommendation {
  id: string;
  type: 'validation' | 'suggestion' | 'warning' | 'info';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  entityField?: string;
  suggestedAction?: string;
  createdAt: Date;
}

export interface AppState {
  user: User | null;
  currentAgent: Agent | null;
  currentContractEntity: ContractEntity | null;
  activeChat: Chat | null;
  recommendations: AgentRecommendation[];
  isLoading: boolean;
  error: string | null;
} 