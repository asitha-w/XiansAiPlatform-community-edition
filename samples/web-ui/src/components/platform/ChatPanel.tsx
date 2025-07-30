import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AgentIcon,
  Person as PersonIcon,
  Circle as StatusIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { ChatMessage, Agent } from '../../types';
import { ChatService } from '../../services/chatService';

interface ChatPanelProps {
  currentAgent?: Agent | null;
  participantId?: string; // Optional - will use SDK config participant ID if not provided
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  currentAgent,
  participantId,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat service
  useEffect(() => {
    const chatService = new ChatService({
      onMessageReceived: (message: ChatMessage) => {
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
      // Use provided participantId or let ChatService use the configured one from SDK config
      participantId,
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
  }, [participantId]);

  // Set current agent when it changes
  useEffect(() => {
    if (chatServiceRef.current && currentAgent && isConnected) {
      const setAgent = async () => {
        try {
          setIsLoadingHistory(true);
          setMessages([]); // Clear messages when switching agents
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatServiceRef.current || !isConnected) {
      return;
    }

    const userMessage: ChatMessage = {
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
      {/* Professional Agent Header */}
      {currentAgent && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0 // Prevent header from shrinking
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <AgentIcon sx={{ fontSize: 24, color: '#6B7280' }} />
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: '#111827'
                }}>
                  {currentAgent.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StatusIcon sx={{ 
                    fontSize: 8, 
                    color: isConnected ? '#10B981' : '#EF4444' 
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: isConnected ? '#10B981' : '#EF4444',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="#6B7280" sx={{ 
                mb: 1,
                lineHeight: 1.4
              }}>
                {currentAgent.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {currentAgent.capabilities.map((capability) => (
                  <Chip
                    key={capability}
                    label={capability}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      height: 24,
                      borderColor: '#D1D5DB',
                      color: '#6B7280',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.75rem',
                      '& .MuiChip-label': {
                        px: 1.5
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <Alert 
            severity="error" 
            icon={<WarningIcon />}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Loading Indicators */}
      {isLoading && !isConnected && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3,
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0
        }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography variant="body2" color="#6B7280">
            Connecting to chat service...
          </Typography>
        </Box>
      )}

      {/* History Loading Indicator */}
      {isLoadingHistory && isConnected && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3,
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0
        }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography variant="body2" color="#6B7280">
            Loading conversation history...
          </Typography>
        </Box>
      )}

      {/* Messages List */}
      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flex: 1, // Take up all available space
          overflow: 'auto',
          overflowX: 'hidden', // Prevent horizontal scroll
          px: 2,
          py: 2,
          minHeight: 0 // Allow shrinking to zero if needed
        }}>
        <List sx={{ p: 0 }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
                px: 0,
                py: 0,
              }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2.5,
                maxWidth: '85%',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              }}>
                <Avatar sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: message.sender === 'agent' ? '#6B7280' : '#374151'
                }}>
                  {message.sender === 'agent' ? <AgentIcon /> : <PersonIcon />}
                </Avatar>
                
                <Box
                  sx={{
                    px: 3.5,
                    py: 2.5,
                    backgroundColor: message.sender === 'user' 
                      ? '#374151' 
                      : '#F9FAFB',
                    color: message.sender === 'user' 
                      ? '#FFFFFF' 
                      : '#111827',
                    borderRadius: 3,
                    border: message.sender === 'agent' ? '1px solid #E5E7EB' : 'none',
                    maxWidth: '100%',
                    boxShadow: message.sender === 'user' 
                      ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)' 
                      : 'none',
                  }}
                >
                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.6
                  }}>
                    {message.content}
                  </Typography>
                </Box>
              </Box>
              
              <Typography 
                variant="caption" 
                color="#9CA3AF"
                sx={{ 
                  mt: 1.5,
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mr: message.sender === 'user' ? 6 : 0,
                  ml: message.sender === 'agent' ? 6 : 0,
                }}
              >
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Professional Message Input */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        flexShrink: 0 // Prevent input area from shrinking
      }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            size="small"
            placeholder={`Message ${currentAgent?.name || 'AI Assistant'}...`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#D1D5DB',
                },
                '&:hover fieldset': {
                  borderColor: '#9CA3AF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6B7280',
                },
              }
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isLoading || !isConnected}
            sx={{
              bgcolor: (messageInput.trim() && isConnected && !isLoading) ? '#374151' : '#F3F4F6',
              color: (messageInput.trim() && isConnected && !isLoading) ? '#FFFFFF' : '#9CA3AF',
              borderRadius: 2,
              width: 44,
              height: 44,
              '&:hover': {
                bgcolor: (messageInput.trim() && isConnected && !isLoading) ? '#1F2937' : '#E5E7EB',
              },
              '&:disabled': {
                bgcolor: '#F3F4F6',
                color: '#9CA3AF',
              }
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPanel; 