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
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const chatServiceRef = useRef<CommsService | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const { documentId } = useRoute();
  const dataMessageContext = useDataMessage();

  // Initialize chat service
  useEffect(() => {
    const chatService = new CommsService({
      onMessageReceived: (message: ChatMessageType) => {
        setMessages(prev => {
          // Check if this is the first history message (indicates history loading start)
          if (prev.length === 0 && message.metadata?.socketMessage) {
            setIsLoadingHistory(true);
            // Set a timeout to stop loading indicator after a reasonable time
            setTimeout(() => setIsLoadingHistory(false), 2000);
          }

          // Prevent duplicate history messages by checking if message already exists
          if (message.metadata?.isHistoryMessage) {
            const messageSocketData = message.metadata?.socketMessage as { id?: string } | undefined;
            const existingMessage = prev.find(m => {
              const existingSocketData = m.metadata?.socketMessage as { id?: string } | undefined;
              return messageSocketData?.id && existingSocketData?.id && 
                     messageSocketData.id === existingSocketData.id;
            });
            if (existingMessage) {
              console.log(`[ChatPanel] Skipping duplicate history message: ${message.id}`);
              return prev;
            }
          }

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
        setIsLoadingHistory(false);
      },
      onDataMessageReceived: (message) => {
        // Publish data messages to the DataMessage context
        dataMessageContext.publish(message);
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
  }, [participantId, documentId, dataMessageContext]);

  // Set current agent when it changes
  useEffect(() => {
    if (chatServiceRef.current && currentAgent && isConnected) {
      const setAgent = async () => {
        try {
          setIsLoadingHistory(true);
          setMessages([]); // Clear messages when switching agents
          setPendingRequests(new Set()); // Clear pending requests when switching agents
          await chatServiceRef.current!.setCurrentAgent(currentAgent);
          // Loading history indicator will be turned off when messages start arriving
        } catch (err) {
          setError('Failed to set current agent');
          setIsLoadingHistory(false);
          console.error('Set agent error:', err);
        }
      };
      
      setAgent();
    }
  }, [currentAgent, isConnected]);

  // Subscribe to WorkLog data messages
  useEffect(() => {
    const handleWorkLogMessage = (payload: DataMessagePayload) => {
      console.log('[ChatPanel] Received WorkLog message:', payload);
      
      // Convert WorkLog data message to chat message for display
      const workLogChatMessage: ChatMessageType = {
        id: `worklog-${payload.message.id || Date.now()}`,
        content: typeof payload.data === 'string' ? payload.data : 'WorkLog update received',
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
    if (!messageInput.trim() || !chatServiceRef.current || !isConnected) {
      return;
    }

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: messageInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    // Add user message immediately to UI
    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsLoading(true);
    setShouldFocusInput(true);

    try {
      await chatServiceRef.current.sendMessage(messageInput);
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
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
      height: 'calc(100vh - 150px)', // Full viewport height minus navbar height
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