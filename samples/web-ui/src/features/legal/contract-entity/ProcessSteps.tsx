import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

interface ProcessStepsProps {
  currentStep?: number;
  steps?: string[];
}

const ProcessSteps: React.FC<ProcessStepsProps> = ({
  currentStep = 0,
  steps = ['Setup', 'Configuration', 'Review', 'Complete'],
}) => {
  return (
    <Box sx={{ 
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
  );
};

export default ProcessSteps;