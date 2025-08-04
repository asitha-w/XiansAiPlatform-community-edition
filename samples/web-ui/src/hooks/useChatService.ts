import { useState, useEffect, useRef, useCallback } from 'react';
import type { Bot, ChatMessage as ChatMessageType } from '../types';
import { CommsService } from '../services/commsService';
import type { Message } from '@99xio/xians-sdk-typescript';

interface UseChatServiceProps {
  participantId?: string;
  onMessageReceived: (message: ChatMessageType) => void;
  onConnectionStateChanged: (connected: boolean) => void;
  onError: (error: string) => void;
  onDataMessageReceived: (message: Message) => void;
  onChatRequestSent: (requestId: string) => void;
  onChatResponseReceived: (requestId: string) => void;
}

interface UseChatServiceReturn {
  chatService: CommsService | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  setCurrentAgent: (agent: Bot, documentId?: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  getCurrentAgent: () => Bot | null;
  updateDocumentId: (documentId?: string) => void;
}

/**
 * Custom hook for managing chat service connection and basic operations
 */
export const useChatService = ({
  participantId,
  onMessageReceived,
  onConnectionStateChanged,
  onError,
  onDataMessageReceived,
  onChatRequestSent,
  onChatResponseReceived,
}: UseChatServiceProps): UseChatServiceReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatServiceRef = useRef<CommsService | null>(null);

  // Initialize chat service
  useEffect(() => {
    console.log('[useChatService] Initializing chat service');
    
    const chatService = new CommsService({
      onMessageReceived,
      onConnectionStateChanged: (connected: boolean) => {
        console.log('[useChatService] Connection state changed:', connected);
        setIsConnected(connected);
        if (connected) {
          setError(null);
        }
        onConnectionStateChanged(connected);
      },
      onError: (errorMessage: string) => {
        setError(errorMessage);
        onError(errorMessage);
      },
      onDataMessageReceived,
      onChatRequestSent,
      onChatResponseReceived,
      participantId,
      documentId: undefined, // Will be set via updateDocumentId when agent is set up
    });

    chatServiceRef.current = chatService;

    // Connect to the service
    const connect = async () => {
      try {
        setIsLoading(true);
        await chatService.connect();
      } catch (err) {
        const errorMessage = 'Failed to connect to chat service';
        setError(errorMessage);
        onError(errorMessage);
        console.error('Chat service connection error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      console.log('[useChatService] Disposing chat service');
      chatService.dispose();
    };
  }, [participantId]); // Only recreate when participantId changes

  const setCurrentAgent = useCallback(async (agent: Bot, documentId?: string) => {
    if (!chatServiceRef.current) {
      throw new Error('Chat service not initialized');
    }

    try {
      // Update document ID if provided
      if (documentId !== undefined) {
        chatServiceRef.current.updateDocumentId(documentId);
      }
      
      await chatServiceRef.current.setCurrentAgent(agent);
    } catch (err) {
      const errorMessage = 'Failed to set current agent';
      setError(errorMessage);
      onError(errorMessage);
      throw err;
    }
  }, [onError]);

  const sendMessage = async (message: string) => {
    if (!chatServiceRef.current) {
      throw new Error('Chat service not initialized');
    }

    if (!isConnected) {
      throw new Error('Chat service not connected');
    }

    try {
      await chatServiceRef.current.sendMessage(message);
    } catch (err) {
      const errorMessage = 'Failed to send message';
      setError(errorMessage);
      onError(errorMessage);
      throw err;
    }
  };

  const getCurrentAgent = () => {
    return chatServiceRef.current?.getCurrentAgent() || null;
  };

  const updateDocumentId = (documentId?: string) => {
    chatServiceRef.current?.updateDocumentId(documentId);
  };

  return {
    chatService: chatServiceRef.current,
    isConnected,
    isLoading,
    error,
    setCurrentAgent,
    sendMessage,
    getCurrentAgent,
    updateDocumentId,
  };
};