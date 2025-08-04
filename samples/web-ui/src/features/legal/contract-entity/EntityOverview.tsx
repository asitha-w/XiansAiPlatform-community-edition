import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import type { ContractValidation, ContractEntity, Contract } from '../../../types';

interface EntityOverviewProps {
  entity?: ContractEntity | null;
  contractData?: Contract | null;
  validations?: ContractValidation[];
  onSave?: (entity: ContractEntity) => void;
  isEditing?: boolean;
  onRefreshDocument?: () => Promise<void>;
}

const EntityOverview: React.FC<EntityOverviewProps> = ({
  entity,
  contractData,
  validations = [],
  onSave,
  isEditing = false,
  onRefreshDocument,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'review_required':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Count validations by severity
  const criticalCount = validations.filter(v => v.severity === 0).length;
  const warningCount = validations.filter(v => v.severity === 1).length;
  const suggestionCount = validations.filter(v => v.severity === 2).length;
  
  // Determine overall status
  const getOverallStatus = () => {
    if (criticalCount > 0) return { status: 'Critical Issues', color: 'error', icon: <ErrorIcon /> };
    if (warningCount > 0) return { status: 'Warnings Present', color: 'warning', icon: <WarningIcon /> };
    if (suggestionCount > 0) return { status: 'Suggestions Available', color: 'info', icon: <InfoIcon /> };
    return { status: 'All Good', color: 'success', icon: <CheckIcon /> };
  };

  const overallStatus = getOverallStatus();

  if (!contractData && !entity) {
    return null;
  }

  return (
    <Box sx={{ 
      backgroundColor: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 2,
      mb: 3
    }}>
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        {/* Contract Title & Basic Info */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 400,
                  color: '#2d3748',
                  mb: 1,
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em'
                }}
              >
                {contractData?.title || entity?.title || 'Untitled Contract'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                    color: '#718096',
                    fontSize: '0.875rem',
                    letterSpacing: '0.025em'
                  }}
                >
                  {contractData?.id || entity?.id}
                </Typography>
                
                {entity && (
                  <Box sx={{
                    px: 2,
                    py: 0.5,
                    backgroundColor: getStatusColor(entity.status) === 'success' ? '#f0fff4' : 
                                   getStatusColor(entity.status) === 'warning' ? '#fffdf7' :
                                   getStatusColor(entity.status) === 'info' ? '#f7faff' : '#fdf2f8',
                    color: getStatusColor(entity.status) === 'success' ? '#22543d' : 
                           getStatusColor(entity.status) === 'warning' ? '#744210' :
                           getStatusColor(entity.status) === 'info' ? '#2a4365' : '#702459',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    borderRadius: 1
                  }}>
                    {entity.status.replace('_', ' ')}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ ml: 3 }}>
              {!isEditing ? (
                <Button
                  startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
                  onClick={() => onRefreshDocument?.()}
                  sx={{ 
                    color: '#4a5568',
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'transparent',
                    borderRadius: 1.5,
                    '&:hover': {
                      backgroundColor: '#f7fafc',
                      borderColor: '#cbd5e0'
                    }
                  }}
                >
                  Refresh
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={() => entity && onSave?.(entity)}
                    sx={{ color: '#38a169', '&:hover': { backgroundColor: '#f0fff4' } }}
                  >
                    <SaveIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton 
                    sx={{ color: '#e53e3e', '&:hover': { backgroundColor: '#fed7d7' } }}
                  >
                    <CancelIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          {/* Meta Information */}
          <Box sx={{ 
            display: 'flex', 
            gap: 4,
            pt: 2,
            borderTop: '1px solid #f7fafc'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#a0aec0',
                fontSize: '0.8rem'
              }}
            >
              Created {contractData?.createdDate ? new Date(contractData.createdDate).toLocaleDateString() : 'Unknown'}
            </Typography>
            {entity?.lastModified && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#a0aec0',
                  fontSize: '0.8rem'
                }}
              >
                Modified {entity.lastModified.toLocaleDateString()}
              </Typography>
            )}
            {entity?.assignedTo && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#a0aec0',
                  fontSize: '0.8rem'
                }}
              >
                Assigned to {entity.assignedTo}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Document Analysis */}
        <Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Overall Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {React.cloneElement(overallStatus.icon, { 
                sx: { 
                  fontSize: 20, 
                  color: overallStatus.color === 'success' ? '#38a169' : 
                         overallStatus.color === 'warning' ? '#d69e2e' :
                         overallStatus.color === 'error' ? '#e53e3e' : '#3182ce'
                } 
              })}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#2d3748',
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}
              >
                {overallStatus.status}
              </Typography>
            </Box>

            {/* Issue Counts */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Critical */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: criticalCount > 0 ? '#fed7d7' : '#f7fafc',
                color: criticalCount > 0 ? '#c53030' : '#a0aec0',
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${criticalCount > 0 ? '#feb2b2' : '#e2e8f0'}`
              }}>
                <ErrorIcon sx={{ 
                  fontSize: 14, 
                  color: 'inherit'
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'inherit',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                >
                  {criticalCount} Critical
                </Typography>
              </Box>

              {/* Warnings */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: warningCount > 0 ? '#faf089' : '#f7fafc',
                color: warningCount > 0 ? '#b7791f' : '#a0aec0',
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${warningCount > 0 ? '#f6e05e' : '#e2e8f0'}`
              }}>
                <WarningIcon sx={{ 
                  fontSize: 14, 
                  color: 'inherit'
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'inherit',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                >
                  {warningCount} Warnings
                </Typography>
              </Box>

              {/* Suggestions */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: suggestionCount > 0 ? '#bee3f8' : '#f7fafc',
                color: suggestionCount > 0 ? '#2c5282' : '#a0aec0',
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${suggestionCount > 0 ? '#90cdf4' : '#e2e8f0'}`
              }}>
                <InfoIcon sx={{ 
                  fontSize: 14, 
                  color: 'inherit'
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'inherit',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                >
                  {suggestionCount} Suggestions
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EntityOverview;