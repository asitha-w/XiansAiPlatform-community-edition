import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AgentIcon,
  Person as PersonIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import type { ChatMessage, Agent } from '../../types';

interface ChatPanelProps {
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  currentAgent?: Agent | null;
  isLoading?: boolean;
}

// Mock data for demonstration
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello! I\'m here to help you with your business processes. What would you like to work on today?',
    sender: 'agent',
    timestamp: new Date(Date.now() - 10000),
    type: 'text',
  },
  {
    id: '2',
    content: 'I need help reviewing this customer order for accuracy.',
    sender: 'user',
    timestamp: new Date(Date.now() - 5000),
    type: 'text',
  },
  {
    id: '3',
    content: 'I\'ll analyze the order details for you. Let me check the customer information and order items.',
    sender: 'agent',
    timestamp: new Date(),
    type: 'text',
  },
];

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Sales Assistant',
    description: 'Helps with orders and customer management',
    capabilities: ['Order Processing', 'Customer Analysis'],
    isActive: true,
    category: 'sales',
  },
  {
    id: '2',
    name: 'Finance Advisor',
    description: 'Financial analysis and invoice management',
    capabilities: ['Invoice Review', 'Financial Analysis'],
    isActive: true,
    category: 'finance',
  },
];

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages = mockMessages,
  onSendMessage,
  currentAgent = mockAgents[0],
  isLoading = false,
}) => {
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim() && onSendMessage) {
      onSendMessage(messageInput);
      setMessageInput('');
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
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      minHeight: '600px'
    }}>
      {/* Professional Agent Header */}
      {currentAgent && (
        <Box sx={{ 
          p: 4, 
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                  <StatusIcon sx={{ fontSize: 8, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ 
                    color: '#10B981',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Active
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="#6B7280" sx={{ 
                mb: 2,
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

      {/* Messages List */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        px: 4,
        py: 3,
        minHeight: 0
      }}>
        <List sx={{ p: 0 }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 4,
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
        p: 4, 
        borderTop: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF'
      }}>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-end' }}>
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
            disabled={!messageInput.trim() || isLoading}
            sx={{
              bgcolor: messageInput.trim() ? '#374151' : '#F3F4F6',
              color: messageInput.trim() ? '#FFFFFF' : '#9CA3AF',
              borderRadius: 2,
              width: 44,
              height: 44,
              '&:hover': {
                bgcolor: messageInput.trim() ? '#1F2937' : '#E5E7EB',
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