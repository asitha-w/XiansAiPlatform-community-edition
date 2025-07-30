import React from 'react';
import { Box } from '@mui/material';

interface ChatOnlyLayoutProps {
  chatPanel: React.ReactNode;
}

const ChatOnlyLayout: React.FC<ChatOnlyLayoutProps> = ({ chatPanel }) => {
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FAFAFA'
    }}>
      {/* Main Content Area - Chat with reduced top spacing */}
      <Box sx={{ 
        flexGrow: 1, 
        width: '100%',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: { xs: 3, sm: 4 }
      }}>
        <Box 
          sx={{ 
            width: '100%',
            maxWidth: '800px',
            height: 'calc(100vh - 120px)', // Adjust height to account for navbar and padding
            maxHeight: '700px',
            px: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Centered Chat Panel */}
          <Box sx={{ 
            flexGrow: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
          }}>
            {chatPanel}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatOnlyLayout;