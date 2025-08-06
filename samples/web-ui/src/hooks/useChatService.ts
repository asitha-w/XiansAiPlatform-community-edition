import { useState, useEffect, useRef, useCallback } from 'react';
import type { Bot, ChatMessage as ChatMessageType } from '../types';
import { BotService } from '../services/botService';
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
  chatService: BotService | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  setCurrentAgent: (agent: Bot) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  getCurrentAgent: () => Bot | null;
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
  const chatServiceRef = useRef<BotService | null>(null);

  // Initialize chat service
  useEffect(() => {
    console.log('[useChatService] Initializing chat service');
    
    const chatService = new BotService({
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
      participantId
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

  const setCurrentAgent = useCallback(async (agent: Bot) => {
    if (!chatServiceRef.current) {
      throw new Error('Chat service not initialized');
    }

    try {
      console.log(`[useChatService] Subscribing to current agent: ${agent.name}`);
      await chatServiceRef.current.subscribeToCurrentAgent();
    } catch (err) {
      const errorMessage = 'Failed to subscribe to current agent';
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
    return chatServiceRef.current?.getCurrentBot() || null;
  };



  return {
    chatService: chatServiceRef.current,
    isConnected,
    isLoading,
    error,
    setCurrentAgent,
    sendMessage,
    getCurrentAgent,
  };
};