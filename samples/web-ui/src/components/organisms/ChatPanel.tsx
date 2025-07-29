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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AgentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { ChatMessage, Agent } from '../../types';

interface ChatPanelProps {
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  currentAgent?: Agent | null;
  availableAgents?: Agent[];
  onSelectAgent?: (agent: Agent) => void;
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
  availableAgents = mockAgents,
  onSelectAgent,
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
      backgroundColor: 'background.paper',
      minHeight: '600px'
    }}>
      {/* Enhanced Agent Selection with Better Spacing */}
      <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: 'grey.50' }}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Select Agent</InputLabel>
          <Select
            value={currentAgent?.id || ''}
            label="Select Agent"
            onChange={(e) => {
              const agent = availableAgents.find(a => a.id === e.target.value);
              if (agent && onSelectAgent) {
                onSelectAgent(agent);
              }
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'grey.100',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'grey.200',
              }
            }}
          >
            {availableAgents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AgentIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {agent.name}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {currentAgent && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ 
              display: 'block', 
              mb: 2,
              lineHeight: 1.5,
              fontSize: '0.8rem'
            }}>
              {currentAgent.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {currentAgent.capabilities.slice(0, 2).map((capability) => (
                <Chip
                  key={capability}
                  label={capability}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem', 
                    height: 24,
                    borderColor: 'grey.200',
                    color: 'text.secondary',
                    backgroundColor: 'grey.50'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Enhanced Messages List with Better Visual Design */}
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
                  bgcolor: message.sender === 'agent' ? 'secondary.main' : 'primary.main',
                  fontSize: '0.875rem'
                }}>
                  {message.sender === 'agent' ? <AgentIcon /> : <PersonIcon />}
                </Avatar>
                
                <Box
                  sx={{
                    px: 3.5,
                    py: 2.5,
                    backgroundColor: message.sender === 'user' 
                      ? 'primary.main' 
                      : 'grey.50',
                    color: message.sender === 'user' 
                      ? 'primary.contrastText' 
                      : 'text.primary',
                    borderRadius: 4,
                    border: message.sender === 'agent' ? '1px solid' : 'none',
                    borderColor: 'grey.100',
                    maxWidth: '100%',
                    boxShadow: message.sender === 'user' 
                      ? '0 2px 8px rgba(46, 52, 64, 0.08)' 
                      : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    lineHeight: 1.6,
                    fontSize: '0.875rem'
                  }}>
                    {message.content}
                  </Typography>
                </Box>
              </Box>
              
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  mt: 1.5,
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mr: message.sender === 'user' ? 6 : 0,
                  ml: message.sender === 'agent' ? 6 : 0,
                  fontSize: '0.75rem',
                  opacity: 0.7
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

      {/* Enhanced Message Input with Better Design */}
      <Box sx={{ 
        p: 4, 
        borderTop: '1px solid',
        borderColor: 'grey.50',
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            size="small"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 3,
                '& fieldset': {
                  borderColor: 'grey.100',
                },
                '&:hover fieldset': {
                  borderColor: 'grey.200',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isLoading}
            sx={{
              bgcolor: messageInput.trim() ? 'primary.main' : 'grey.100',
              color: messageInput.trim() ? 'white' : 'grey.400',
              borderRadius: 3,
              width: 44,
              height: 44,
              '&:hover': {
                bgcolor: messageInput.trim() ? 'primary.dark' : 'grey.200',
                boxShadow: messageInput.trim() ? '0 2px 8px rgba(46, 52, 64, 0.12)' : 'none',
              },
              '&:disabled': {
                bgcolor: 'grey.100',
                color: 'grey.400',
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