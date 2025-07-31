import React from 'react';
import {
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';
import type { Agent } from '../../types';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isConnected: boolean;
  currentAgent?: Agent | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  setMessageInput,
  onSendMessage,
  onKeyPress,
  isLoading,
  isConnected,
  currentAgent,
}) => {
  return (
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
          onKeyPress={onKeyPress}
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
          onClick={onSendMessage}
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
  );
};

export default MessageInput;