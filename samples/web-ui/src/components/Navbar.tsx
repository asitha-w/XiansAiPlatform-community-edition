import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  SmartToy as AgentIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Agent } from '../types';

interface NavbarProps {
  currentAgent?: Agent;
  availableAgents?: Agent[];
  onSelectAgent?: (agent: Agent) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentAgent,
  availableAgents = [],
  onSelectAgent,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [agentMenuAnchorEl, setAgentMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const isNewRoute = location.pathname.endsWith('/new');
  const shouldShowAgentSelector = currentAgent || (isNewRoute && availableAgents.length > 0);
  const shouldShowNewButton = currentAgent || isNewRoute;

  const handleAgentMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAgentMenuAnchorEl(event.currentTarget);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchorEl(null);
  };

  const handleAgentSelect = (agent: Agent) => {
    if (onSelectAgent) {
      onSelectAgent(agent);
    }
    handleAgentMenuClose();
  };

  const handleNewClick = () => {
    if (currentAgent?.slug) {
      navigate(`/${currentAgent.slug}/new`);
    }
  };

  return (
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
          {/* Left side - Logo and Agent Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography 
              variant="h5" 
              component="div" 
              onClick={() => navigate('/')}
              sx={{ 
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#111827',
                cursor: 'pointer',
                '&:hover': {
                  color: '#374151'
                }
              }}
            >
              AI Studio
            </Typography>

            {/* Agent Selector - Shown when current agent exists or on new route */}
            {shouldShowAgentSelector && (
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
                        {currentAgent ? currentAgent.name : 'Select Agent'}
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
          
          {/* Right side - New button and User controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* New button */}
            {shouldShowNewButton && (
              <Button
                onClick={handleNewClick}
                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                variant="outlined"
                sx={{
                  px: 3,
                  py: 1.5,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  color: '#374151',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#F9FAFB',
                    borderColor: '#9CA3AF',
                    color: '#111827',
                  },
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  mr: 2,
                }}
              >
                New
              </Button>
            )}
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
  );
};

export default Navbar;