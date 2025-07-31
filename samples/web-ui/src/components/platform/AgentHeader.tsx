import React from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import type { Agent } from '../../types';

interface AgentHeaderProps {
  currentAgent: Agent;
  isConnected: boolean;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({
  currentAgent,
  isConnected,
}) => {
  return (
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
  );
};

export default AgentHeader;