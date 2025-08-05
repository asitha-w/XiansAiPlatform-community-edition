import { useState, useEffect, useRef, useCallback } from 'react';
import type { Bot } from '../types';
import { getCurrentDocumentIdGlobal } from '../utils/documentUtils';

interface UseChatAgentStateProps {
  currentAgent?: Bot | null;
  isConnected: boolean;
  setCurrentAgent: (agent: Bot) => Promise<void>;
  clearMessages: () => void;
  setIsLoadingHistory: (loading: boolean) => void;
  onError: (error: string) => void;
}

interface UseChatAgentStateReturn {
  pendingRequests: Set<string>;
  addPendingRequest: (requestId: string) => void;
  removePendingRequest: (requestId: string) => void;
}

/**
 * Custom hook for managing agent state and document changes
 */
export const useChatAgentState = ({
  currentAgent,
  isConnected,
  setCurrentAgent,
  clearMessages,
  setIsLoadingHistory,
  onError,
}: UseChatAgentStateProps): UseChatAgentStateReturn => {
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const previousDocumentIdRef = useRef<string | undefined>(undefined);

  // Helper function to clear loading history with timeout management
  const clearLoadingHistory = useCallback((delay: number = 0) => {
    if (delay > 0) {
      setTimeout(() => {
        console.log('[useChatAgentState] Clearing loading history indicator');
        setIsLoadingHistory(false);
      }, delay);
    } else {
      setIsLoadingHistory(false);
    }
  }, [setIsLoadingHistory]);

  // Handle agent changes, initial connection, and documentId changes
  useEffect(() => {
    // Get current document ID from URL
    const documentId = getCurrentDocumentIdGlobal();
    console.log('[useChatAgentState] Agent/Connection sync - currentAgent:', currentAgent?.name, 'isConnected:', isConnected, 'documentId:', documentId);
    
    if (!currentAgent || !isConnected) {
      console.log('[useChatAgentState] Skipping agent subscription - missing requirements');
      return;
    }

    const handleAgentSetup = async () => {
      try {
        const documentIdChanged = previousDocumentIdRef.current !== documentId;
        
        if (documentIdChanged) {
          console.log('[useChatAgentState] Document ID changed from', previousDocumentIdRef.current, 'to', documentId);
          console.log('[useChatAgentState] Clearing messages for document change');
          clearMessages();
          setPendingRequests(new Set());
        }
        
        console.log('[useChatAgentState] Setting up agent:', currentAgent.name);
        
        setIsLoadingHistory(true);
        await setCurrentAgent(currentAgent);
        
        // Loading history indicator will be turned off when messages start arriving
        // Fallback: Clear loading indicator after 3 seconds if no messages arrive
        clearLoadingHistory(3000);
        

      } catch (err) {
        onError('Failed to set current agent');
        clearLoadingHistory();
        console.error('Agent setup error:', err);
      }
    };

    handleAgentSetup();
  }, [isConnected, currentAgent, setCurrentAgent, clearMessages, setIsLoadingHistory, onError, clearLoadingHistory]); // Depend on connection state and agent

  const addPendingRequest = (requestId: string) => {
    console.log('[useChatAgentState] Chat request sent:', requestId);
    setPendingRequests(prev => new Set(prev).add(requestId));
  };

  const removePendingRequest = (requestId: string) => {
    console.log('[useChatAgentState] Chat response received:', requestId);
    setPendingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  return {
    pendingRequests,
    addPendingRequest,
    removePendingRequest,
  };
};