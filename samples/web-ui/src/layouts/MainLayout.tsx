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
  Menu,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  SmartToy as AgentIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import type { Agent } from '../types';

interface MainLayoutProps {
  children?: React.ReactNode;
  chatPanel: React.ReactNode;
  entityPanel: React.ReactNode;
  recommendationsPanel?: React.ReactNode; // Now optional since it's integrated
  currentStep?: number; // Current step in the process
  steps?: string[]; // Array of step names
  currentAgent?: Agent;
  availableAgents?: Agent[];
  onSelectAgent?: (agent: Agent) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  chatPanel,
  entityPanel,
  currentStep = 0,
  steps = ['Setup', 'Configuration', 'Review', 'Complete'],
  currentAgent,
  availableAgents = [],
  onSelectAgent,
  // recommendationsPanel is now integrated into entityPanel
}) => {
  const [agentMenuAnchorEl, setAgentMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleAgentMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAgentMenuAnchorEl(event.currentTarget);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchorEl(null);
  };

  const handleAgentSelect = (agent: Agent) => {
    onSelectAgent?.(agent);
    handleAgentMenuClose();
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FAFAFA'
    }}>
      {/* Professional Header */}
      <AppBar position="static" elevation={0} sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <Box sx={{ 
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          px: { xs: 4, sm: 5 } 
        }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: 0, py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Typography variant="h5" component="div" sx={{ 
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#111827'
              }}>
                AI Studio
              </Typography>

              {/* Professional Agent Selection */}
              {currentAgent && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    onClick={handleAgentMenuClick}
                    endIcon={<ArrowDownIcon />}
                    sx={{
                      px: 3,
                      py: 1.5,
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #D1D5DB',
                      borderRadius: 1.5,
                      textTransform: 'none',
                      color: '#374151',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        borderColor: '#9CA3AF',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AgentIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                          {currentAgent.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1, textTransform: 'capitalize' }}>
                          {currentAgent.category}
                        </Typography>
                      </Box>
                    </Box>
                  </Button>

                  <Menu
                    anchorEl={agentMenuAnchorEl}
                    open={Boolean(agentMenuAnchorEl)}
                    onClose={handleAgentMenuClose}
                    sx={{
                      '& .MuiPaper-root': {
                        mt: 1,
                        borderRadius: 2,
                        minWidth: 300,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #E5E7EB',
                      }
                    }}
                  >
                    {availableAgents.map((agent) => (
                      <MenuItem 
                        key={agent.id} 
                        onClick={() => handleAgentSelect(agent)}
                        selected={agent.id === currentAgent?.id}
                        sx={{ 
                          py: 2.5, 
                          px: 3,
                          '&.Mui-selected': {
                            backgroundColor: '#F9FAFB',
                          },
                          '&:hover': {
                            backgroundColor: '#F3F4F6',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, width: '100%' }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: '#F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E5E7EB'
                          }}>
                            <AgentIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: '#111827' }}>
                              {agent.name}
                            </Typography>
                            <Typography variant="caption" color="#6B7280" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                              {agent.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                              {agent.capabilities.slice(0, 2).map((capability) => (
                                <Chip
                                  key={capability}
                                  label={capability}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    height: 22,
                                    fontSize: '0.7rem',
                                    borderColor: '#D1D5DB',
                                    color: '#6B7280',
                                    backgroundColor: '#FFFFFF',
                                    '& .MuiChip-label': {
                                      px: 1.5
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton 
                color="inherit" 
                size="small"
                sx={{ 
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  '&:hover': { 
                    backgroundColor: '#F9FAFB',
                    borderColor: '#D1D5DB',
                    color: '#374151'
                  }
                }}
              >
                <NotificationsIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                size="small"
                sx={{ 
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  '&:hover': { 
                    backgroundColor: '#F9FAFB',
                    borderColor: '#D1D5DB',
                    color: '#374151'
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: '#6B7280',
                  ml: 2,
                  fontWeight: 500,
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem'
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

            {/* Enhanced Business Entity Panel */}
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