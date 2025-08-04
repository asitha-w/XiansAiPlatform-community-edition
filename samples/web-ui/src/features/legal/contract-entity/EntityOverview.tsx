import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import type { ContractValidation } from '../../../types';

interface EntityOverviewProps {
  validations?: ContractValidation[];
}

const EntityOverview: React.FC<EntityOverviewProps> = ({
  validations = [],
}) => {
  // Count validations by severity
  const criticalCount = validations.filter(v => v.severity === 0).length;
  const warningCount = validations.filter(v => v.severity === 1).length;
  const suggestionCount = validations.filter(v => v.severity === 2).length;
  
  const totalIssues = criticalCount + warningCount + suggestionCount;
  
  // Determine overall status
  const getOverallStatus = () => {
    if (criticalCount > 0) return { status: 'Critical Issues', color: 'error', icon: <ErrorIcon /> };
    if (warningCount > 0) return { status: 'Warnings Present', color: 'warning', icon: <WarningIcon /> };
    if (suggestionCount > 0) return { status: 'Suggestions Available', color: 'info', icon: <InfoIcon /> };
    return { status: 'All Good', color: 'success', icon: <CheckIcon /> };
  };

  const overallStatus = getOverallStatus();

  return (
    <Box sx={{ 
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
      p: 3,
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
          Document Insights
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          {overallStatus.icon}
          <Chip 
            label={overallStatus.status}
            color={overallStatus.color as 'error' | 'warning' | 'info' | 'success'}
            variant="outlined"
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {totalIssues === 0 ? 'No issues found' : `${totalIssues} total issue${totalIssues !== 1 ? 's' : ''} found`}
        </Typography>
      </Box>

      {/* Severity Breakdown */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {/* Critical Issues */}
        <Card 
          variant="outlined" 
          sx={{ 
            borderColor: criticalCount > 0 ? 'error.main' : 'grey.200',
            backgroundColor: criticalCount > 0 ? 'error.50' : 'grey.50'
          }}
        >
          <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
            <ErrorIcon 
              sx={{ 
                fontSize: 24, 
                mb: 1, 
                color: criticalCount > 0 ? 'error.main' : 'grey.400' 
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {criticalCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Critical
            </Typography>
          </CardContent>
        </Card>

        {/* Warnings */}
        <Card 
          variant="outlined" 
          sx={{ 
            borderColor: warningCount > 0 ? 'warning.main' : 'grey.200',
            backgroundColor: warningCount > 0 ? 'warning.50' : 'grey.50'
          }}
        >
          <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
            <WarningIcon 
              sx={{ 
                fontSize: 24, 
                mb: 1, 
                color: warningCount > 0 ? 'warning.main' : 'grey.400' 
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {warningCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Warnings
            </Typography>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card 
          variant="outlined" 
          sx={{ 
            borderColor: suggestionCount > 0 ? 'info.main' : 'grey.200',
            backgroundColor: suggestionCount > 0 ? 'info.50' : 'grey.50'
          }}
        >
          <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
            <InfoIcon 
              sx={{ 
                fontSize: 24, 
                mb: 1, 
                color: suggestionCount > 0 ? 'info.main' : 'grey.400' 
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {suggestionCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Suggestions
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Summary */}
      {totalIssues > 0 && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {criticalCount > 0 && `${criticalCount} critical issue${criticalCount !== 1 ? 's' : ''} require immediate attention`}
            {criticalCount > 0 && (warningCount > 0 || suggestionCount > 0) && ' • '}
            {warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? 's' : ''} to review`}
            {warningCount > 0 && suggestionCount > 0 && ' • '}
            {suggestionCount > 0 && `${suggestionCount} suggestion${suggestionCount !== 1 ? 's' : ''} for improvement`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EntityOverview;