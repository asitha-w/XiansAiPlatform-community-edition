import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  List,
} from '@mui/material';
import type { ChatMessage as ChatMessageType, Agent } from '../../types';
import { CommsService } from '../../services/commsService';
import { useRoute } from '../../hooks/useRoute';
import ChatMessageComponent from './ChatMessage';
import WorkLogMessageGroup from './WorkLogMessageGroup';
import AgentHeader from './AgentHeader';
import MessageInput, { type MessageInputRef } from './MessageInput';
import LoadingIndicators from './LoadingIndicators';
import ErrorAlert from './ErrorAlert';
import TypingIndicator from './TypingIndicator';
import { useDataMessage } from '../../hooks/useDataMessage';
import type { DataMessagePayload } from '../../context/context';
import type { UIComponentRef } from '../legal/chat-components/ComponentRegistry';

interface ChatPanelProps {
  currentAgent?: Agent | null;
  participantId?: string; // Optional - will use SDK config participant ID if not provided
}

// Helper function to group consecutive worklog messages
const groupMessages = (messages: ChatMessageType[]) => {
  const groups: Array<{ type: 'chat' | 'worklog'; messages: ChatMessageType[]; isGrouped: boolean }> = [];
  let currentGroup: ChatMessageType[] = [];
  let currentType: 'chat' | 'worklog' | null = null;

  for (const message of messages) {
    const isWorkLog = message.metadata?.isWorkLogMessage === true;
    const messageType = isWorkLog ? 'worklog' : 'chat';

    if (messageType !== currentType) {
      // Save the previous group if it exists
      if (currentGroup.length > 0 && currentType) {
        groups.push({
          type: currentType,
          messages: currentGroup,
          isGrouped: currentType === 'worklog' && currentGroup.length > 1,
        });
      }
      // Start a new group
      currentGroup = [message];
      currentType = messageType;
    } else {
      // Add to current group
      currentGroup.push(message);
    }
  }

  // Add the last group
  if (currentGroup.length > 0 && currentType) {
    groups.push({
      type: currentType,
      messages: currentGroup,
      isGrouped: currentType === 'worklog' && currentGroup.length > 1,
    });
  }

  return groups;
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  currentAgent,
  participantId,
}) => {
  // Removed render logging to stop console spam during infinite render loop
  
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<string[]>([]);
  const chatServiceRef = useRef<CommsService | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const loadingHistoryTimeoutRef = useRef<number | null>(null);
  const { documentId } = useRoute();
  const dataMessageContext = useDataMessage();

  // Helper function to clear loading history with timeout management
  const clearLoadingHistory = (delay: number = 0) => {
    if (loadingHistoryTimeoutRef.current) {
      clearTimeout(loadingHistoryTimeoutRef.current);
    }
    
    if (delay > 0) {
      loadingHistoryTimeoutRef.current = setTimeout(() => {
        console.log('[ChatPanel] Clearing loading history indicator');
        setIsLoadingHistory(false);
        loadingHistoryTimeoutRef.current = null;
      }, delay);
    } else {
      setIsLoadingHistory(false);
      loadingHistoryTimeoutRef.current = null;
    }
  };

  // Track component lifecycle
  useEffect(() => {
    console.log('[ChatPanel] 🚀 Component mounted');
    return () => {
      console.log('[ChatPanel] 💀 Component unmounting');
      // Clear any pending loading history timeout
      if (loadingHistoryTimeoutRef.current) {
        clearTimeout(loadingHistoryTimeoutRef.current);
      }
    };
  }, []);

  // Initialize chat service
  useEffect(() => {
    console.log('[ChatPanel] 🔧 Initialize chat service useEffect triggered');
    const chatService = new CommsService({
      onMessageReceived: (message: ChatMessageType) => {
        setMessages(prev => {
          // Check if this is the first history message (indicates history loading start)
          if (prev.length === 0 && message.metadata?.socketMessage) {
            setIsLoadingHistory(true);
            // Loading indicator will be turned off when all history messages finish loading
            clearLoadingHistory(1500);
          }
          
          // If we're loading history and receive any message, turn off loading after a short delay
          // This handles cases where agent setup triggered loading but we need to clear it
          if (message.metadata?.isHistoryMessage || message.sender === 'agent') {
            clearLoadingHistory(500);
          }

          // Prevent duplicate history messages by checking if message already exists
          // ONLY apply deduplication to history messages, not user messages
          if (message.metadata?.isHistoryMessage) {
            const messageSocketData = message.metadata?.socketMessage as { id?: string } | undefined;
            const messageId = messageSocketData?.id || message.id;
            
            // Check for duplicates using both socket message ID and content hash for better deduplication
            const existingMessage = prev.find(m => {
              // Only compare with other history messages to avoid interfering with user messages
              if (!m.metadata?.isHistoryMessage) {
                return false;
              }
              
              const existingSocketData = m.metadata?.socketMessage as { id?: string } | undefined;
              const existingId = existingSocketData?.id || m.id;
              
              // Match by ID first
              if (messageId && existingId && messageId === existingId) {
                return true;
              }
              
              // If IDs don't match or are missing, check by content and timestamp
              // This handles cases where the same message might have different IDs
              if (m.content === message.content && 
                  Math.abs(m.timestamp.getTime() - message.timestamp.getTime()) < 1000) {
                return true;
              }
              
              return false;
            });
            
            if (existingMessage) {
              console.log(`[ChatPanel] Skipping duplicate history message: ${messageId || 'no-id'}`);
              return prev;
            }
          }

          // Debug log for all messages being added
          console.log(`[ChatPanel] Adding message to UI - Sender: ${message.sender}, Content: "${message.content.substring(0, 50)}...", ID: ${message.id}`);

          return [...prev, message];
        });
      },
      onConnectionStateChanged: (connected: boolean) => {
        console.log('[ChatPanel] 🔌 Connection state changed:', connected);
        setIsConnected(connected);
        if (connected) {
          setError(null);
        }
      },
      onError: (errorMessage: string) => {
        setError(errorMessage);
        clearLoadingHistory();
      },
      onDataMessageReceived: (message) => {
        dataMessageContext.publish(message);
        console.log('[ChatPanel] Data message received:', message);
      },
      onChatRequestSent: (requestId: string) => {
        console.log('[ChatPanel] Chat request sent:', requestId);
        setPendingRequests(prev => new Set(prev).add(requestId));
      },
      onChatResponseReceived: (requestId: string) => {
        console.log('[ChatPanel] Chat response received:', requestId);
        setPendingRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      },
      // Use provided participantId or let ChatService use the configured one from SDK config
      participantId,
      // Pass documentId from route context for inclusion in all messages
      documentId,
    });

    chatServiceRef.current = chatService;

    // Connect to the service
    const connect = async () => {
      try {
        setIsLoading(true);
        await chatService.connect();
      } catch (err) {
        setError('Failed to connect to chat service');
        console.error('Chat service connection error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      chatService.dispose();
    };
  }, [participantId, documentId, dataMessageContext]); // Temporarily removed dataMessageContext to test infinite render fix

  // Handle agent changes and initial connection
  useEffect(() => {
    console.log('[ChatPanel] 🎯 Agent/Connection sync - currentAgent:', currentAgent?.name, 'isConnected:', isConnected, 'chatService:', !!chatServiceRef.current);
    
    if (!chatServiceRef.current || !currentAgent || !isConnected) {
      console.log('[ChatPanel] ❌ Skipping agent subscription - missing requirements');
      return;
    }

    const handleAgentSetup = async () => {
      try {
        const existingAgent = chatServiceRef.current!.getCurrentAgent();
        const needsNewAgent = !existingAgent || existingAgent.workflow !== currentAgent.workflow;
        
        if (needsNewAgent) {
          console.log('[ChatPanel] 🚀 Setting up agent:', currentAgent.name);
          
          // Only clear messages when switching to a different agent (not on reconnection)
          if (existingAgent && existingAgent.workflow !== currentAgent.workflow) {
            console.log('[ChatPanel] 🧹 Clearing messages for agent switch');
            setMessages([]);
            setPendingRequests(new Set());
          }
          
          setIsLoadingHistory(true);
          await chatServiceRef.current!.setCurrentAgent(currentAgent);
          // Loading history indicator will be turned off when messages start arriving
          // Fallback: Clear loading indicator after 3 seconds if no messages arrive
          clearLoadingHistory(3000);
        } else {
          console.log('[ChatPanel] ✅ Agent already set:', currentAgent.name);
        }
      } catch (err) {
        setError('Failed to set current agent');
        clearLoadingHistory();
        console.error('Agent setup error:', err);
      }
    };

    handleAgentSetup();
  }, [isConnected, currentAgent]); // Depend on both connection state AND agent

  // Process pending messages when connection is established and agent is ready
  useEffect(() => {
    console.log('[ChatPanel] 🔄 Pending message check - isConnected:', isConnected, 'hasAgent:', !!chatServiceRef.current?.getCurrentAgent(), 'pendingCount:', pendingMessages.length);
    
    if (isConnected && chatServiceRef.current?.getCurrentAgent() && pendingMessages.length > 0) {
      console.log('[ChatPanel] ✅ Processing', pendingMessages.length, 'pending messages');
      
      const messagesToProcess = [...pendingMessages];
      setPendingMessages([]); // Clear the queue immediately to prevent re-processing
      
      // Process messages sequentially to maintain order and better error handling
      const processNextMessage = async (messageIndex: number) => {
        if (messageIndex >= messagesToProcess.length) {
          setIsLoading(false);
          return;
        }

        const message = messagesToProcess[messageIndex];
        
        // Double-check connection and agent state before each message
        if (!chatServiceRef.current || !isConnected || !chatServiceRef.current.getCurrentAgent()) {
          console.warn('[ChatPanel] Connection or agent lost while processing pending messages');
          setError('Connection lost while processing pending messages');
          setIsLoading(false);
          // Re-queue remaining messages
          setPendingMessages(messagesToProcess.slice(messageIndex));
          return;
        }

        try {
          console.log('[ChatPanel] Sending queued message:', message.substring(0, 50) + '...');
          setIsLoading(true);
          
          // Send to agent first - only add to UI if successful
          await chatServiceRef.current.sendMessage(message);
          
          // Only add user message to UI after successful backend call
          const userMessage: ChatMessageType = {
            id: `user-queued-${Date.now()}-${messageIndex}`,
            content: message,
            sender: 'user',
            timestamp: new Date(),
            type: 'text',
          };
          
          setMessages(prev => [...prev, userMessage]);
          console.log('[ChatPanel] Successfully added user message to UI:', message.substring(0, 50) + '...');
          
          // Check if this is the last message
          if (messageIndex === messagesToProcess.length - 1) {
            // Last message - clear loading state and we're done
            setIsLoading(false);
            return;
          }
          
          // For non-final messages, temporarily clear loading then continue
          setIsLoading(false);
          
          // Small delay before processing next message to avoid overwhelming the service
          setTimeout(() => processNextMessage(messageIndex + 1), 300);
          
        } catch (err) {
          console.error('[ChatPanel] Failed to send queued message:', err);
          setError(`Failed to send message: "${message.substring(0, 30)}..."`);
          setIsLoading(false);
          
          // Re-queue remaining messages (including the failed one) for retry
          setPendingMessages(messagesToProcess.slice(messageIndex));
        }
      };

      // Start processing from the first message
      processNextMessage(0);
    }
  }, [isConnected, pendingMessages, currentAgent]); // Added currentAgent to ensure it triggers when agent is ready

  // Subscribe to WorkLog data messages
  useEffect(() => {
    const handleWorkLogMessage = (payload: DataMessagePayload) => {
      console.log('[ChatPanel] Received WorkLog message:', payload);
      
      // Convert WorkLog data message to chat message for display
      const workLogChatMessage: ChatMessageType = {
        id: `worklog-${payload.message.id || Date.now()}`,
        content: typeof payload.data === 'string' ? payload.data : 'WorkLog update received, please wait for the agent to respond',
        sender: 'agent',
        timestamp: new Date(payload.message.createdAt || Date.now()),
        type: 'text',
        metadata: {
          isWorkLogMessage: true,
          socketMessage: payload.message,
          messageSubject: payload.messageSubject,
        },
      };

      // Add the WorkLog message to the chat
      setMessages(prev => [...prev, workLogChatMessage]);
    };

    // Subscribe to WorkLog messages
    const unsubscribe = dataMessageContext.subscribe('WorkLog', handleWorkLogMessage);

    return unsubscribe;
  }, [dataMessageContext]);

  // Subscribe to UIComponent data messages
  useEffect(() => {
    const handleUICommandMessage = (payload: DataMessagePayload) => {
      console.log('[ChatPanel] Received UICommand message:', payload);
      
      // Extract UIComponent data
      const uiComponentData = payload.data as UIComponentRef;
      
      // Convert UIComponent data message to chat message for display
      const uiCommandChatMessage: ChatMessageType = {
        id: `ui-component-${payload.message.id || Date.now()}`,
        content: '', // No text content, just the component
        sender: 'agent',
        timestamp: new Date(payload.message.createdAt || Date.now()),
        type: 'action',
        metadata: {
          isUIComponent: true,
          uiComponentData,
          socketMessage: payload.message,
          messageSubject: payload.messageSubject,
        },
      };

      // Add the UIComponent message to the chat
      setMessages(prev => [...prev, uiCommandChatMessage]);
      
      // Restore focus to chat input after UI component is rendered
      setShouldFocusInput(true);
    };

    // Subscribe to UICommand messages
    const unsubscribe = dataMessageContext.subscribe('UICommand', handleUICommandMessage);

    return unsubscribe;
  }, [dataMessageContext]);

  // Listen for SendChat events from UI components
  useEffect(() => {
    const handleSendChat = async (event: CustomEvent) => {
      console.log('[ChatPanel] Received SendChat event:', event.detail);
      
      const { message } = event.detail as { message: string };
      if (message && typeof message === 'string') {
        // Send the message to the agent
        if (chatServiceRef.current && isConnected && chatServiceRef.current.getCurrentAgent()) {
          try {
            setIsLoading(true);

            // Send to agent first - only add to UI if successful
            await chatServiceRef.current.sendMessage(message);
            
            // Only add user message to UI after successful backend call
            const userMessage: ChatMessageType = {
              id: `user-${Date.now()}`,
              content: message,
              sender: 'user',
              timestamp: new Date(),
              type: 'text',
            };

            setMessages(prev => [...prev, userMessage]);
          } catch (err) {
            setError('Failed to send message to agent');
            console.error('Send message error:', err);
          } finally {
            setIsLoading(false);
          }
        } else {
          console.log('[ChatPanel] Chat service not ready, queueing message for later delivery');
          setPendingMessages(prev => [...prev, message]);
        }
      }
    };

    // Listen for SendChat events
    const eventHandler = (event: Event) => {
      handleSendChat(event as CustomEvent);
      // Restore focus to chat input after UI component is rendered
      setShouldFocusInput(true);
    };
    
    window.addEventListener('SendChat', eventHandler);

    return () => {
      window.removeEventListener('SendChat', eventHandler);
    };
  }, [isConnected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Handle input focus after user sends message
  useEffect(() => {
    if (shouldFocusInput && messageInputRef.current) {
      const focusInput = () => {
        messageInputRef.current?.focusInput();
        setShouldFocusInput(false);
      };
      
      // Use a longer timeout to ensure all updates are complete
      const timeoutId = setTimeout(focusInput, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocusInput]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatServiceRef.current || !isConnected || !chatServiceRef.current.getCurrentAgent()) {
      // Prevent sending until connected and agent subscription is ready
      return;
    }

    const messageToSend = messageInput;
    setIsLoading(true);
    setShouldFocusInput(true);

    try {
      // Send to agent first - only add to UI if successful
      await chatServiceRef.current.sendMessage(messageToSend);
      
      // Only add user message to UI and clear input after successful backend call
      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        content: messageToSend,
        sender: 'user',
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, userMessage]);
      setMessageInput(''); // Clear input only after successful send
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
      // Keep the message in the input field so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 175px)', // Full viewport height minus navbar height
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden' // Prevent any overflow that might push content down
    }}>
      {/* Agent Header */}
      {currentAgent && (
        <AgentHeader 
          currentAgent={currentAgent} 
          isConnected={isConnected} 
        />
      )}

      {/* Error Alert */}
      <ErrorAlert 
        error={error} 
        onClose={() => setError(null)} 
      />

      {/* Loading Indicators */}
      <LoadingIndicators 
        isLoading={isLoading}
        isConnected={isConnected}
        isLoadingHistory={isLoadingHistory}
      />

      {/* Messages List */}
      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flex: 1, // Take up all available space
          overflow: 'auto',
          overflowX: 'hidden', // Prevent horizontal scroll
          px: 1, // Reduced from 2 to 1 for more horizontal space
          py: 1.5, // Reduced from 2 to 1.5
          minHeight: 0 // Allow shrinking to zero if needed
        }}>
        {messages.length === 0 && !isLoadingHistory && !isLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              px: 3,
              py: 6,
            }}
          >
            <Box
              sx={{
                color: 'text.secondary',
                fontSize: '1.1rem',
                fontWeight: 500,
                mb: 1,
              }}
            >
              {currentAgent ? `Welcome to ${currentAgent.name}!` : 'Welcome!'}
            </Box>
            <Box
              sx={{
                color: 'text.disabled',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                maxWidth: 400,
              }}
            >
              Send a message below to start the conversation and begin working with your AI assistant.
            </Box>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {groupMessages(messages).map((group, index) => {
              if (group.type === 'worklog') {
                return (
                  <WorkLogMessageGroup
                    key={`worklog-group-${index}-${group.messages[0]?.id}`}
                    messages={group.messages}
                    isGrouped={group.isGrouped}
                  />
                );
              } else {
                return group.messages.map((message) => (
                  <ChatMessageComponent
                    key={message.id}
                    message={message}
                  />
                ));
              }
            })}
          </List>
        )}
      </Box>

      {/* Typing Indicator */}
      <TypingIndicator 
        isVisible={pendingRequests.size > 0}
      />

      {/* Message Input */}
      <MessageInput 
        ref={messageInputRef}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isLoading}
        isConnected={isConnected}
        currentAgent={currentAgent}
      />
    </Box>
  );
};

export default ChatPanel; 