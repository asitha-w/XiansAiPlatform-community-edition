import React from 'react';
import { Box } from '@mui/material';
import ContractEntityPanel from './ContractEntityPanel';
import ProcessSteps from './ProcessSteps';
import { useRoute } from '../../../hooks/useRoute';
import type { ContractEntity, AgentRecommendation } from '../../../types';

interface ContractEntityPanelProps {
  entity?: ContractEntity | null;
  onEdit?: (entity: ContractEntity) => void;
  onSave?: (entity: ContractEntity) => void;
  isEditing?: boolean;
  recommendations?: AgentRecommendation[];
  onDismissRecommendation?: (id: string) => void;
  onApplyRecommendation?: (id: string) => void;
}

// Wrapper component that includes ProcessSteps above ContractEntityPanel
interface ContractEntityWithStepsProps extends ContractEntityPanelProps {
  currentStep?: number;
  steps?: string[];
}

export const ContractEntityWithSteps: React.FC<ContractEntityWithStepsProps> = ({
  currentStep,
  steps,
  ...entityPanelProps
}) => {
  const { mode, documentId } = useRoute();
  
  // Determine current step and entity based on route mode
  const resolvedCurrentStep = currentStep ?? (mode === 'new' ? 0 : undefined);
  const resolvedEntity = mode === 'new' ? null : entityPanelProps.entity;
  
  // TODO: If documentId is provided, load the specific document
  // This would typically involve a data fetch or lookup
  console.log('ContractEntityWithSteps - mode:', mode, 'documentId:', documentId);
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Process Steps - with its own styling */}
      <ProcessSteps 
        currentStep={resolvedCurrentStep ?? 0} 
        steps={steps ?? ['Document Review', 'Validation', 'Processing', 'Complete']} 
      />
      
      {/* Contract Entity Panel - wrapped in its own container */}
      <Box sx={{ 
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <ContractEntityPanel {...entityPanelProps} entity={resolvedEntity} />
      </Box>
    </Box>
  );
};

export default ContractEntityWithSteps;