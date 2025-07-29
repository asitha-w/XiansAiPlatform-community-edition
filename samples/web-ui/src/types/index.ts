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
  isActive: boolean;
  category: AgentCategory;
}

export type AgentCategory = 
  | 'sales'
  | 'customer-service'
  | 'finance'
  | 'operations'
  | 'general';

export interface BusinessEntity {
  id: string;
  type: BusinessEntityType;
  title: string;
  status: string;
  data: BusinessEntityData;
  lastModified: Date;
  assignedTo?: string;
}

export interface BusinessEntityData {
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

export type BusinessEntityType = 
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
  businessEntityId?: string;
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
  currentBusinessEntity: BusinessEntity | null;
  activeChat: Chat | null;
  recommendations: AgentRecommendation[];
  isLoading: boolean;
  error: string | null;
} 