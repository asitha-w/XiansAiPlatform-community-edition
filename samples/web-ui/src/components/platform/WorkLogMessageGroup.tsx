import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Avatar,
  ListItem,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as WorkLogIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../types';

interface WorkLogMessageGroupProps {
  messages: ChatMessage[];
  isGrouped: boolean;
}

const WorkLogMessageGroup: React.FC<WorkLogMessageGroupProps> = ({ 
  messages, 
  isGrouped 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse logic: if grouped and has more than one message, auto-collapse after 5 seconds
  useEffect(() => {
    if (isGrouped && messages.length > 1) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isGrouped, messages.length]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // If there's only one message and it's not grouped, render it normally but with worklog styling
  if (!isGrouped || messages.length === 1) {
    const message = messages[0];
    return (
      <ListItem
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: 1,
          px: 0,
          py: 0,
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          maxWidth: '92%',
          width: '100%',
        }}>
          <Avatar sx={{ 
            width: 28, 
            height: 28,
            bgcolor: '#8B5CF6', // Purple for worklog
            opacity: 0.8,
          }}>
            <WorkLogIcon sx={{ fontSize: 16 }} />
          </Avatar>
          
          <Box
            sx={{
              px: 3,
              py: 2,
              backgroundColor: '#FAFBFC',
              color: '#4B5563',
              border: '1px solid #D1D5DB',
              borderRadius: 0.5, // Much less rounded than chat bubbles
              maxWidth: '100%',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              opacity: 0.95,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #8B5CF6 0%, transparent 50%)',
                opacity: 0.3,
              },
              '& p': {
                margin: '0 0 0.5em 0',
                '&:last-child': {
                  marginBottom: 0,
                },
              },
              '& code': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                padding: '0.125em 0.25em',
                borderRadius: '0.25em',
                fontSize: '0.75em',
                fontFamily: 'monospace',
                color: '#7C3AED',
              },
            }}
          >
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </Box>
        </Box>
        
        <Typography 
          variant="caption" 
          color="#9CA3AF"
          sx={{ 
            mt: 1,
            ml: 4,
            fontSize: '0.7rem',
          }}
        >
          Work Log • {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </ListItem>
    );
  }

  // Grouped worklog messages with collapsible header
  return (
    <ListItem
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        mb: 1.5,
        px: 0,
        py: 0,
      }}
    >
      {/* Collapsible Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          width: '100%',
          cursor: 'pointer',
          py: 1,
          px: 1,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: '#F9FAFB',
          },
        }}
        onClick={handleToggleExpanded}
      >
        <Avatar sx={{ 
          width: 24, 
          height: 24,
          bgcolor: '#8B5CF6',
          opacity: 0.7,
        }}>
          <WorkLogIcon sx={{ fontSize: 14 }} />
        </Avatar>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6B7280',
            fontWeight: 500,
            flex: 1,
            fontSize: '0.85rem',
          }}
        >
          Work Logs ({messages.length} {messages.length === 1 ? 'entry' : 'entries'})
        </Typography>
        
        <IconButton 
          size="small" 
          sx={{ 
            color: '#9CA3AF',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isExpanded} sx={{ width: '100%' }}>
        <Box sx={{ pl: 0, position: 'relative' }}>
          {/* Timeline vertical line */}
          <Box
            sx={{
              position: 'absolute',
              left: '19px', // Center line with dots
              top: '8px',
              bottom: '8px',
              width: '2px',
              backgroundColor: '#E5E7EB',
              opacity: 0.6,
            }}
          />
          
          {messages.map((message, index) => (
            <Box 
              key={message.id}
              sx={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: index === messages.length - 1 ? 0 : 1.5,
                position: 'relative',
                pl: 2, // Add padding to the entire message row
              }}
            >
              {/* Timeline dot */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#8B5CF6',
                  opacity: 0.6,
                  mt: 1,
                  flexShrink: 0, // Prevent dot from shrinking
                  zIndex: 1,
                }}
              />
              
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: '#FAFBFC',
                  color: '#4B5563',
                  border: '1px solid #D1D5DB',
                  borderRadius: 0.5, // Much less rounded than chat bubbles
                  maxWidth: 'calc(100% - 40px)', // Adjusted for new layout
                  flex: 1,
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  opacity: 0.95,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, #8B5CF6 0%, transparent 70%)',
                    opacity: 0.2,
                  },
                  '& p': {
                    margin: '0 0 0.5em 0',
                    '&:last-child': {
                      marginBottom: 0,
                    },
                  },
                  '& code': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    padding: '0.125em 0.25em',
                    borderRadius: '0.25em',
                    fontSize: '0.75em',
                    fontFamily: 'monospace',
                    color: '#7C3AED',
                  },
                }}
              >
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
                
                <Typography 
                  variant="caption" 
                  color="#9CA3AF"
                  sx={{ 
                    mt: 0.5,
                    display: 'block',
                    fontSize: '0.7rem',
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </ListItem>
  );
};

export default WorkLogMessageGroup;