import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lightbulb as SuggestionIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { AgentRecommendation } from '../../types';

interface RecommendationsPanelProps {
  recommendations?: AgentRecommendation[];
  onDismiss?: (id: string) => void;
  onApply?: (id: string) => void;
}

// Mock data for demonstration
const mockRecommendations: AgentRecommendation[] = [
  {
    id: 'rec-1',
    type: 'validation',
    title: 'Order Total Verified',
    description: 'The order calculations are correct. Tax amount and total match expected values.',
    priority: 'low',
    createdAt: new Date(Date.now() - 5000),
  },
  {
    id: 'rec-2',
    type: 'warning',
    title: 'Customer Credit Check',
    description: 'Customer has exceeded their credit limit by $2,450. Consider requesting payment before delivery.',
    priority: 'high',
    entityField: 'orderDetails.total',
    suggestedAction: 'Request payment',
    createdAt: new Date(Date.now() - 10000),
  },
  {
    id: 'rec-3',
    type: 'suggestion',
    title: 'Upsell Opportunity',
    description: 'Customer frequently orders implementation services. Consider offering a training package at 15% discount.',
    priority: 'medium',
    suggestedAction: 'Add training package',
    createdAt: new Date(Date.now() - 15000),
  },
];

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations = mockRecommendations,
  onDismiss,
  onApply,
}) => {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'validation':
        return <CheckIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'suggestion':
        return <SuggestionIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getIconColor = (priority: string) => {
    if (priority === 'high') return '#EBCB8B';
    if (priority === 'medium') return '#88C0D0';
    if (priority === 'low') return '#A3BE8C';
    return '#80868B'; // Updated to softer color
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Priority';
    }
  };

  // Group recommendations by priority
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.priority]) acc[rec.priority] = [];
    acc[rec.priority].push(rec);
    return acc;
  }, {} as Record<string, AgentRecommendation[]>);

  const priorityOrder = ['high', 'medium', 'low'];

  if (recommendations.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.secondary',
        p: 3
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 32, mb: 1, opacity: 0.3 }} />
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            No Insights Available
          </Typography>
          <Typography variant="caption" color="text.secondary">
            AI recommendations will appear here as you work
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {priorityOrder.map((priority, priorityIndex) => {
        const recs = groupedRecommendations[priority];
        if (!recs || recs.length === 0) return null;

        return (
          <Box key={priority}>
            {priorityIndex > 0 && (
              <Box sx={{ 
                height: 1, 
                backgroundColor: 'grey.50', 
                mx: 3, 
                my: 2 
              }} />
            )}
            
            {/* Enhanced Priority Section */}
            <Box sx={{ px: 3, py: 1.5 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 600,
                  color: getIconColor(priority),
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  mb: 1.5,
                  display: 'block'
                }}
              >
                {getPriorityLabel(priority)} ({recs.length})
              </Typography>
              
              {recs.map((recommendation, recIndex) => (
                <Box 
                  key={recommendation.id}
                  sx={{ 
                    py: 1,
                    px: 0,
                    borderBottom: recIndex < recs.length - 1 ? '1px solid #F1F3F4' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {/* Icon */}
                    <Box sx={{ 
                      mt: 0.125,
                      color: getIconColor(recommendation.priority),
                      opacity: 0.8,
                      flexShrink: 0
                    }}>
                      {getRecommendationIcon(recommendation.type)}
                    </Box>
                    
                    {/* Content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            lineHeight: 1.3,
                            color: 'text.primary'
                          }}
                        >
                          {recommendation.title}
                        </Typography>
                        
                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 0.25, ml: 1.5, flexShrink: 0 }}>
                          {recommendation.suggestedAction && (
                            <Tooltip title="Apply suggestion">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApply?.(recommendation.id);
                                }}
                                sx={{ 
                                  color: '#A3BE8C',
                                  '&:hover': { backgroundColor: 'rgba(163, 190, 140, 0.08)' },
                                  p: 0.25
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Dismiss">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismiss?.(recommendation.id);
                              }}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                p: 0.25
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 12 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: recommendation.suggestedAction ? 0.75 : 0.5, 
                          lineHeight: 1.4
                        }}
                      >
                        {recommendation.description}
                      </Typography>
                      
                      {/* Suggested Action - Inline */}
                      {recommendation.suggestedAction && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#5F6368',
                            fontStyle: 'italic',
                            mb: 0.5
                          }}
                        >
                          💡 {recommendation.suggestedAction}
                        </Typography>
                      )}
                      
                      {/* Timestamp and entity field */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          opacity: 0.6
                        }}
                      >
                        {recommendation.createdAt.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {recommendation.entityField && (
                          <>
                            {' • '}
                            <Typography component="span" variant="caption" sx={{ 
                              fontFamily: 'monospace',
                              opacity: 0.7
                            }}>
                              {recommendation.entityField}
                            </Typography>
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default RecommendationsPanel; 