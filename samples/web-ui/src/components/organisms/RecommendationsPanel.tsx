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

  const getIconColor = (type: string, priority: string) => {
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
        p: 6
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
            No Insights Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
                mx: 4, 
                my: 5 
              }} />
            )}
            
            {/* Enhanced Priority Section */}
            <Box sx={{ px: 4, py: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 600,
                  color: getIconColor('', priority),
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.75rem',
                  mb: 4,
                  display: 'block'
                }}
              >
                {getPriorityLabel(priority)} ({recs.length})
              </Typography>
              
              {recs.map((recommendation, recIndex) => (
                <Box 
                  key={recommendation.id}
                  sx={{ 
                    mb: recIndex < recs.length - 1 ? 4 : 0,
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: priority === 'high' ? '#FFF9E6' : '#FCFCFC',
                    border: '1px solid',
                    borderColor: priority === 'high' ? '#F0D49C' : '#F1F3F4',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: priority === 'high' ? '#EBCB8B' : '#E8EAED',
                      backgroundColor: priority === 'high' ? '#FFF6D9' : '#F8F9FA',
                      boxShadow: '0 2px 12px rgba(46, 52, 64, 0.04)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3.5 }}>
                    <Box sx={{ 
                      mt: 0.5,
                      color: getIconColor(recommendation.type, recommendation.priority),
                      opacity: 0.8
                    }}>
                      {getRecommendationIcon(recommendation.type)}
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            lineHeight: 1.4,
                            color: 'text.primary',
                            fontSize: '0.95rem'
                          }}
                        >
                          {recommendation.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 3 }}>
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
                                  '&:hover': { backgroundColor: 'rgba(163, 190, 140, 0.08)' }
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 16 }} />
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
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.6 }}
                      >
                        {recommendation.description}
                      </Typography>
                      
                      {recommendation.suggestedAction && (
                        <Box sx={{ 
                          p: 3,
                          backgroundColor: '#F0F7FF',
                          borderRadius: 2,
                          border: '1px solid #E1F0FF',
                          mb: 3
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: '#2E3440',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}>
                            💡 {recommendation.suggestedAction}
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.75rem',
                          display: 'block',
                          opacity: 0.7
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
                              fontSize: '0.7rem',
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