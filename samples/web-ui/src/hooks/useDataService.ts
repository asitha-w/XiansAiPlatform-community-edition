import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FlowService } from '../services/flowService';
import type { FlowServiceOptions } from '../services/flowService';
import type { Message } from '@99xio/xians-sdk-typescript';
import type { Bot } from '../types';
import { useDataMessage } from './useDataMessage';

interface UseDataServiceOptions extends Omit<FlowServiceOptions, 'participantId' | 'documentId'> {
  agents: Bot[];
  documentId?: string;
}

interface UseDataServiceReturn {
  /**
   * Send a data message to the current agent's flow
   */
  sendDataMessage: (text: string, data?: Record<string, unknown>) => Promise<void>;
  
  /**
   * Send a data message to a specific flow (overrides current agent's flow)
   */
  sendDataMessageToFlow: (flowId: string, text: string, data?: Record<string, unknown>) => Promise<void>;
  
  /**
   * Subscribe to a specific flow for receiving data messages
   */
  subscribeToFlow: (flowId: string) => Promise<void>;
  
  /**
   * Update the document ID context for messages
   */
  updateDocumentId: (documentId?: string) => void;
  
  /**
   * Current connection status
   */
  isConnected: boolean;
  
  /**
   * Current agent (if any)
   */
  currentAgent?: Bot;
  
  /**
   * Current flow ID (from current agent)
   */
  currentFlow?: string;
  
  /**
   * Error state
   */
  error?: string;
  
  /**
   * Last received data message
   */
  lastDataMessage?: Message;
}

/**
 * Hook for using data service with current agent context
 * Automatically connects to the agent's flow based on current route
 */
export function useDataService(options: UseDataServiceOptions): UseDataServiceReturn {
  const { agents, documentId, ...dataServiceOptions } = options;
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [lastDataMessage, setLastDataMessage] = useState<Message | undefined>();
  const serviceInstanceRef = useRef<FlowService | null>(null);
  const currentDocumentIdRef = useRef<string | undefined>(documentId);
  const dataMessageContext = useDataMessage();

  // Determine current agent based on URL
  const currentAgent = (() => {
    const currentPath = location.pathname.slice(1); // Remove leading slash
    const agentSlug = currentPath ? currentPath.split('/')[0] : undefined;
    return agentSlug ? agents.find(agent => agent.slug === agentSlug) : undefined;
  })();

  const currentFlow = currentAgent?.flow;

  // Initialize data service instance
  useEffect(() => {
    if (serviceInstanceRef.current) {
      return; // Already initialized
    }

    // Extract callback references to avoid dependency issues
    const { onDataMessageReceived, onConnectionStateChanged, onError: onErrorCallback, ...otherOptions } = dataServiceOptions;

    const serviceOptions: FlowServiceOptions = {
      ...otherOptions,
      documentId: currentDocumentIdRef.current,
      onDataMessageReceived: (message: Message) => {
        console.log('[useDataService] Data message received:', message);
        setLastDataMessage(message);
        
        // Publish to data message context for subscription handlers
        dataMessageContext.publish(message);
        
        onDataMessageReceived?.(message);
      },
      onConnectionStateChanged: (connected: boolean) => {
        console.log('[useDataService] Connection state changed:', connected);
        setIsConnected(connected);
        setError(connected ? undefined : 'Disconnected');
        onConnectionStateChanged?.(connected);
      },
      onError: (errorMessage: string) => {
        console.error('[useDataService] Error:', errorMessage);
        setError(errorMessage);
        onErrorCallback?.(errorMessage);
      },
    };

    serviceInstanceRef.current = new FlowService(serviceOptions);

    // Connect to the service
    serviceInstanceRef.current.connect().catch((err) => {
      console.error('[useDataService] Failed to connect:', err);
      setError(`Failed to connect: ${err.message}`);
    });

    return () => {
      if (serviceInstanceRef.current) {
        serviceInstanceRef.current.dispose();
        serviceInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies intentionally omitted - this should only run once

  // Update document ID when it changes
  useEffect(() => {
    if (currentDocumentIdRef.current !== documentId) {
      currentDocumentIdRef.current = documentId;
      serviceInstanceRef.current?.updateDocumentId(documentId);
    }
  }, [documentId]);

  // Subscribe to current agent's flow when agent or connection changes
  useEffect(() => {
    const subscribeToCurrentFlow = async () => {
      if (!serviceInstanceRef.current || !isConnected || !currentFlow) {
        return;
      }

      try {
        console.log(`[useDataService] Subscribing to flow for agent: ${currentAgent?.name} (${currentFlow})`);
        await serviceInstanceRef.current.subscribeToFlow(currentFlow);
      } catch (error) {
        console.error(`[useDataService] Failed to subscribe to flow: ${currentFlow}`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(`Failed to subscribe to flow: ${errorMessage}`);
      }
    };

    subscribeToCurrentFlow();
  }, [currentFlow, isConnected, currentAgent?.name]);

  // Send data message to current agent's flow
  const sendDataMessage = useCallback(async (text: string, data: Record<string, unknown> = {}) => {
    if (!serviceInstanceRef.current) {
      throw new Error('Data service not initialized');
    }

    if (!currentFlow) {
      throw new Error(`Current agent (${currentAgent?.name || 'unknown'}) does not have a flow defined`);
    }

    console.log(`[useDataService] Sending data message to current flow: ${currentFlow}`, { text, data });
    await serviceInstanceRef.current.sendDataMessage(currentFlow, text, data);
  }, [currentFlow, currentAgent?.name]);

  // Send data message to specific flow
  const sendDataMessageToFlow = useCallback(async (flowId: string, text: string, data: Record<string, unknown> = {}) => {
    if (!serviceInstanceRef.current) {
      throw new Error('Data service not initialized');
    }

    console.log(`[useDataService] Sending data message to flow: ${flowId}`, { text, data });
    await serviceInstanceRef.current.sendDataMessage(flowId, text, data);
  }, []);

  // Subscribe to specific flow
  const subscribeToFlow = useCallback(async (flowId: string) => {
    if (!serviceInstanceRef.current) {
      throw new Error('Data service not initialized');
    }

    console.log(`[useDataService] Manual subscription to flow: ${flowId}`);
    await serviceInstanceRef.current.subscribeToFlow(flowId);
  }, []);

  // Update document ID
  const updateDocumentId = useCallback((newDocumentId?: string) => {
    currentDocumentIdRef.current = newDocumentId;
    serviceInstanceRef.current?.updateDocumentId(newDocumentId);
  }, []);

  return {
    sendDataMessage,
    sendDataMessageToFlow,
    subscribeToFlow,
    updateDocumentId,
    isConnected,
    currentAgent,
    currentFlow,
    error,
    lastDataMessage,
  };
}