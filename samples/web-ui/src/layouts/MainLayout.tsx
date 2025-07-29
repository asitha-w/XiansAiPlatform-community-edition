import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface MainLayoutProps {
  children?: React.ReactNode;
  chatPanel: React.ReactNode;
  entityPanel: React.ReactNode;
  recommendationsPanel?: React.ReactNode; // Now optional since it's integrated
  currentStep?: number; // Current step in the process
  steps?: string[]; // Array of step names
}

const MainLayout: React.FC<MainLayoutProps> = ({
  chatPanel,
  entityPanel,
  currentStep = 0,
  steps = ['Setup', 'Configuration', 'Review', 'Complete'],
  // recommendationsPanel is now integrated into entityPanel
}) => {
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FAFAFA' // Slightly cooler background
    }}>
      {/* Enhanced Header with Stronger Border */}
      <AppBar position="static" elevation={0} sx={{
        backgroundColor: 'background.paper',
        borderBottom: '2px solid #E0E0E0'
      }}>
        <Box sx={{ 
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          px: { xs: 4, sm: 5 } 
        }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: 0, py: 3 }}>
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'text.primary',
              fontSize: '1.35rem'
            }}>
              AI Studio
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton 
                color="inherit" 
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  '&:hover': { 
                    backgroundColor: 'rgba(46, 52, 64, 0.04)',
                    borderColor: '#BDBDBD',
                    color: 'text.primary'
                  }
                }}
              >
                <NotificationsIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  '&:hover': { 
                    backgroundColor: 'rgba(46, 52, 64, 0.04)',
                    borderColor: '#BDBDBD',
                    color: 'text.primary'
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main',
                  ml: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                U
              </Avatar>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>

      {/* Enhanced Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        width: '100%',
        backgroundColor: '#F5F5F5' // Subtle content area distinction
      }}>
        <Box 
          sx={{ 
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
            px: { xs: 4, sm: 5 },
            py: { xs: 4, sm: 5 },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 4, sm: 5 }, 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' }
          }}>
            {/* Enhanced Chat Panel with Stronger Border */}
            <Box sx={{ 
              flex: { xs: '1', md: '0 0 420px' },
              minHeight: { xs: '400px', md: '600px' },
              display: 'flex',
              flexDirection: 'column',
              position: { md: 'sticky' },
              top: { md: 0 }
            }}>
              <Box sx={{ 
                flexGrow: 1,
                backgroundColor: 'background.paper',
                borderRadius: 3,
                border: '2px solid #E0E0E0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}>
                {chatPanel}
              </Box>
            </Box>

            {/* Enhanced Business Entity Panel */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Process Steps with Enhanced Border */}
              <Box sx={{ 
                mb: 4,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                p: 3,
                border: '2px solid #E8E8E8',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
              }}>
                <Stepper activeStep={currentStep} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel 
                        sx={{
                          '& .MuiStepLabel-label': {
                            fontSize: '0.875rem',
                            fontWeight: index === currentStep ? 600 : 400,
                          }
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ 
                backgroundColor: '#FEFEFE', // Slightly warmer white
                borderRadius: 3,
                border: '2px solid #DADADA',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}>
                {entityPanel}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 