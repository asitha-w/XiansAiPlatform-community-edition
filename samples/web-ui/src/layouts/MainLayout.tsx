import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

interface MainLayoutProps {
  children?: React.ReactNode;
  chatPanel: React.ReactNode;
  agentComponent: React.ReactNode; // Dynamic agent component
  currentStep?: number; // Current step in the process
  steps?: string[]; // Array of step names
}

const MainLayout: React.FC<MainLayoutProps> = ({
  chatPanel,
  agentComponent,
  currentStep = 0,
  steps = ['Setup', 'Configuration', 'Review', 'Complete'],
}) => {
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FAFAFA'
    }}>
      {/* Enhanced Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        width: '100%',
        backgroundColor: '#F9FAFB'
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
            {/* Enhanced Chat Panel */}
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
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {chatPanel}
              </Box>
            </Box>

            {/* Agent Component Panel */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Process Steps */}
              <Box sx={{ 
                mb: 4,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                p: 3,
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Stepper activeStep={currentStep} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel 
                        sx={{
                          '& .MuiStepLabel-label': {
                            fontWeight: index === currentStep ? 600 : 400,
                            color: index === currentStep ? '#111827' : '#6B7280',
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
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {agentComponent}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 