import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Description as ContractIcon } from '@mui/icons-material';
import EntityDetails from './EntityDetails';
import EntityOverview from './EntityOverview';
import { useParams } from 'react-router-dom';
import { useDataService } from '../../../hooks/useDataService';
import { useDataMessage } from '../../../hooks/useDataMessage';
import type { EntityDetailsProps } from './EntityDetails';
import type { Bot, ContractEntity, ContractValidation, Contract } from '../../../types';
import type { DataMessagePayload } from '../../../context/context';
import type { Message } from '@99xio/xians-sdk-typescript';

// Interface for DocumentUpdate message data structure (handles both casing variants)
interface DocumentUpdateData {
  contract?: Contract;
  Contract?: Contract;
  validations?: ContractValidation[];
  Validations?: ContractValidation[];
}

// Wrapper component for ContractEntityPanel with routing support
// Now renders EntityOverview (header + validation insights) and EntityDetails (document content) as separate components
interface ContractEntityPanelProps extends EntityDetailsProps {
  // Legacy props for backwards compatibility - no longer used since validation insights 
  // are shown automatically based on DocumentUpdate messages
  currentStep?: number;
  steps?: string[];
  
  // Required for data service functionality
  agents: Bot[];
}

export const ContractEntityPanel: React.FC<ContractEntityPanelProps> = ({
  currentStep, // Deprecated - validation insights are now shown automatically
  steps,       // Deprecated - validation insights are now shown automatically
  agents,
  ...entityPanelProps
}) => {
  const { mode, documentId } = useParams<{ mode?: string; documentId?: string }>();
  
  // State management for contract data and validations
  const [contractData, setContractData] = useState<Contract | null>(null);
  const [validations, setValidations] = useState<ContractValidation[]>([]);
  const [entity, setEntity] = useState<ContractEntity | null>(entityPanelProps.entity || null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editableContract, setEditableContract] = useState<Contract | null>(null);
  
  // Data message context for subscribing to DocumentUpdate messages
  const dataMessageContext = useDataMessage();
  
  // Helper function to determine contract status based on validations
  const getContractStatus = useCallback((validations: ContractValidation[]): string => {
    const hasErrors = validations.some(v => v.severity === 0);
    const hasWarnings = validations.some(v => v.severity === 1);
    
    if (hasErrors) return 'needs_attention';
    if (hasWarnings) return 'review_required';
    return 'in_progress';
  }, []);

  // Edit mode handlers
  const handleEditToggle = useCallback(() => {
    if (!isEditing && contractData) {
      setEditableContract({ ...contractData });
    }
    setIsEditing(!isEditing);
  }, [isEditing, contractData]);

  const handleSave = useCallback((updatedContract: Contract) => {
    setContractData(updatedContract);
    setIsEditing(false);
    setEditableContract(null);
    
    // Update the entity with the new contract data
    const updatedEntity: ContractEntity = {
      id: updatedContract.id,
      type: 'contract',
      title: updatedContract.title || '',
      status: getContractStatus(validations),
      data: {
        contract: updatedContract,
        validations: validations,
      },
      lastModified: new Date(),
      assignedTo: 'admin@example.com',
    };
    
    setEntity(updatedEntity);
    console.log('[ContractEntityPanel] Contract updated:', updatedContract.title);
  }, [validations, getContractStatus]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditableContract(null);
  }, []);

  const handleContractChange = useCallback((updatedContract: Contract) => {
    setEditableContract(updatedContract);
  }, []);
  
  // Memoize callback functions to prevent dataService recreation
  const onDataMessageReceived = useCallback((message: Message) => {
    console.log('[ContractEntityWithSteps] Data message received:', message);
    // Handle incoming data messages (e.g., document updates, validation results)
  }, []);

  const onConnectionStateChanged = useCallback((connected: boolean) => {
    console.log('[ContractEntityWithSteps] Data service connected:', connected);
  }, []);

  const onError = useCallback((error: string) => {
    console.error('[ContractEntityWithSteps] Data service error:', error);
  }, []);

  // Initialize data service with current context
  const dataService = useDataService({
    agents,
    documentId,
    onDataMessageReceived,
    onConnectionStateChanged,
    onError,
  });
  
  // Subscribe to DocumentUpdate messages from both flow and bot
  useEffect(() => {
    const handleDocumentUpdate = (payload: DataMessagePayload) => {
      console.log('[ContractEntityWithSteps] 🎯 DocumentUpdate handler called with payload:', payload);
      
      const data = payload.data as DocumentUpdateData;
      // Handle both possible casing variants
      const contract = data?.contract || data?.Contract;
      const validations = data?.validations || data?.Validations || [];
      
      if (data && contract) {
        console.log('[ContractEntityWithSteps] ✅ Valid contract data found, updating state');
        setContractData(contract);
        setValidations(validations);
        
        // Create or update the entity
        const updatedEntity: ContractEntity = {
          id: contract.id,
          type: 'contract',
          title: contract.title || '',
          status: getContractStatus(validations),
          data: {
            contract: contract,
            validations: validations,
          },
          lastModified: new Date(),
          assignedTo: 'admin@example.com',
        };
        
        setEntity(updatedEntity);
        console.log('[ContractEntityWithSteps] ✅ Entity updated successfully with contract:', contract.title);
      } else {
        console.warn('[ContractEntityWithSteps] ⚠️  DocumentUpdate payload missing contract data:', data);
        console.warn('[ContractEntityWithSteps] Available data keys:', data ? Object.keys(data) : 'no data');
      }
    };

    console.log('[ContractEntityWithSteps] 📝 Subscribing to DocumentUpdate messages');
    const unsubscribe = dataMessageContext.subscribe('DocumentUpdate', handleDocumentUpdate);
    return () => {
      console.log('[ContractEntityWithSteps] 🗑️ Unsubscribing from DocumentUpdate messages');
      unsubscribe();
    };
  }, [dataMessageContext, getContractStatus]);

  // Update entity when prop changes
  useEffect(() => {
    if (entityPanelProps.entity) {
      setEntity(entityPanelProps.entity);
      if (entityPanelProps.entity.data?.contract) {
        setContractData(entityPanelProps.entity.data.contract);
        setValidations(entityPanelProps.entity.data.validations || []);
      }
    }
  }, [entityPanelProps.entity]);
  
  // Determine entity based on route mode  
  const resolvedEntity = mode === 'new' ? null : entity;

  // Extract dataService properties to avoid ESLint dependency warnings
  const { isConnected, currentFlow, sendDataMessage } = dataService;
  
  // Log deprecated usage for backwards compatibility tracking
  if (currentStep !== undefined || steps !== undefined) {
    console.warn('ContractEntityWithSteps: currentStep and steps props are deprecated. Validation insights are now shown automatically based on DocumentUpdate messages.');
  }
  
  // Add loading state and track fetched documents to prevent multiple simultaneous requests
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const hasInitialFetchRef = useRef<string | null>(null);
  const prevConnectionStateRef = useRef<boolean>(false);

  // Function to get/refresh validated document
  const getValidatedDocument = React.useCallback(async () => {
    if (!documentId) {
      console.warn('[ContractEntityWithSteps] Cannot get document: no document ID');
      return;
    }
    
    if (isLoadingDocument) {
      console.log('[ContractEntityWithSteps] GetValidatedDocument already in progress, skipping');
      return;
    }
    
    try {
      setIsLoadingDocument(true);
      await dataService.sendDataMessage('GetValidatedDocument', {
        documentId,
      });
      console.log('[ContractEntityWithSteps] GetValidatedDocument request sent for:', documentId);
    } catch (error) {
      console.error('[ContractEntityWithSteps] Failed to send GetValidatedDocument request:', error);
    } finally {
      // Reset loading state after a short delay to prevent immediate re-triggers
      setTimeout(() => setIsLoadingDocument(false), 1000);
    }
  }, [dataService, documentId, isLoadingDocument]);

  // Alias for backward compatibility
  const refreshDocument = getValidatedDocument;
  
  // Update document ID in data service when it changes and clear fetched tracking
  React.useEffect(() => {
    dataService.updateDocumentId(documentId);
    // Reset the ref when documentId changes so we can fetch the new document
    hasInitialFetchRef.current = null;
    
    // Clear existing data when documentId changes to avoid showing stale data
    if (documentId) {
      console.log('[ContractEntityWithSteps] Document ID changed, clearing existing data:', documentId);
      setContractData(null);
      setValidations([]);
      setEntity(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]); // Only depend on documentId, not dataService

  // Automatically fetch validated document when conditions are met
  React.useEffect(() => {
    const shouldFetch = (
      documentId && // We have a document ID
      hasInitialFetchRef.current !== documentId && // Haven't fetched this document yet
      isConnected && // Service is connected
      currentFlow && // Flow is available (means subscription is likely ready)
      !isLoadingDocument // Not currently loading
    );

    if (shouldFetch) {
      console.log('[ContractEntityWithSteps] Auto-fetching validated document for:', documentId, 'flow:', currentFlow);
      hasInitialFetchRef.current = documentId; // Mark as fetched immediately to prevent duplicates
      
      // Add a small delay to ensure flow subscription is fully established
      const fetchTimeout = setTimeout(async () => {
        try {
          setIsLoadingDocument(true);
          // Request the document from the bot
          await sendDataMessage('GetValidatedDocument', {
            documentId,
          });
          console.log('[ContractEntityWithSteps] GetValidatedDocument request sent for:', documentId);

          // Send a chat message to the bot
          const message = `Please retrieve the status of this contract.`;

          const sendChatEvent = new CustomEvent('SendChat', {
            detail: {
              message: message
            }
          });
    
          window.dispatchEvent(sendChatEvent);
        } catch (error) {
          console.error('[ContractEntityWithSteps] Failed to send GetValidatedDocument request:', error);
          // Reset the ref so we can retry
          hasInitialFetchRef.current = null;
        } finally {
          setTimeout(() => setIsLoadingDocument(false), 1000);
        }
      }, 100); // Small delay to ensure flow subscription is ready

      return () => clearTimeout(fetchTimeout);
    } else if (documentId && hasInitialFetchRef.current === documentId) {
      console.log('[ContractEntityWithSteps] Document already fetched, skipping auto-fetch for:', documentId);
    } else if (documentId && !isConnected) {
      console.log('[ContractEntityWithSteps] Waiting for data service connection before fetching document:', documentId);
    } else if (documentId && !currentFlow) {
      console.log('[ContractEntityWithSteps] Waiting for flow subscription before fetching document:', documentId);
    }
  }, [documentId, isConnected, currentFlow, sendDataMessage, isLoadingDocument]);

  // Handle connection state changes - ensure we fetch when service becomes ready
  React.useEffect(() => {
    const wasConnected = prevConnectionStateRef.current;
    const isNowConnected = isConnected;
    
    // Only trigger if connection changed from false to true
    if (isNowConnected && !wasConnected) {
      console.log('[ContractEntityWithSteps] Service connected, checking if document fetch needed:', documentId);
      
      // Don't fetch immediately - let the main effect handle it after flow subscription
      // This prevents duplicate requests
      if (documentId && hasInitialFetchRef.current !== documentId) {
        console.log('[ContractEntityWithSteps] Document fetch will be handled by main effect after flow subscription');
      }
    }
    
    // Update the previous connection state
    prevConnectionStateRef.current = isNowConnected;
  }, [isConnected, documentId]);

  // Failsafe: Retry document loading after a delay if document hasn't been loaded
  React.useEffect(() => {
    if (!documentId) return;

    const retryTimeout = setTimeout(() => {
      // Check if we still need to fetch the document
      const needsRetry = (
        documentId &&
        hasInitialFetchRef.current !== documentId &&
        isConnected &&
        currentFlow &&
        !isLoadingDocument &&
        !contractData // No contract data loaded yet
      );

      if (needsRetry) {
        console.log('[ContractEntityWithSteps] Failsafe: Retrying document fetch for:', documentId);
        hasInitialFetchRef.current = documentId;
        
        (async () => {
          try {
            setIsLoadingDocument(true);
            await sendDataMessage('GetValidatedDocument', {
              documentId,
            });
            console.log('[ContractEntityWithSteps] Failsafe: GetValidatedDocument request sent for:', documentId);
          } catch (error) {
            console.error('[ContractEntityWithSteps] Failsafe: Failed to send GetValidatedDocument request:', error);
            hasInitialFetchRef.current = null; // Allow future retries
          } finally {
            setTimeout(() => setIsLoadingDocument(false), 1000);
          }
        })();
      }
    }, 2000); // Wait 2 seconds before retry

    return () => clearTimeout(retryTimeout);
  }, [documentId, isConnected, currentFlow, sendDataMessage, isLoadingDocument, contractData]);
  
  console.log('ContractEntityWithSteps - mode:', mode, 'documentId:', documentId, 'currentFlow:', currentFlow, 'isConnected:', isConnected, 'hasContract:', !!contractData);
  
  // Show "No Contract Selected" message when there's no contract data or entity
  if (!contractData && !resolvedEntity) {
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        p: 4
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <ContractIcon sx={{ fontSize: 80, mb: 3, opacity: 0.3 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, mb: 2 }}>
            No Contract Selected
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Select a contract to view details or wait for contract data to load
          </Typography>
          {documentId && (
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, fontFamily: 'monospace' }}>
              Document ID: {documentId}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Entity Overview - Header and Validation Summary */}
      <EntityOverview
        entity={resolvedEntity}
        contractData={isEditing ? editableContract : contractData}
        validations={validations}
        isEditing={isEditing}
        onRefreshDocument={refreshDocument}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      
      {/* Entity Details - Document Content */}
      <EntityDetails 
        entity={resolvedEntity}
        contractData={contractData}
        validations={validations}
        isEditing={isEditing}
        onContractChange={handleContractChange}
      />
    </Box>
  );
};

export default ContractEntityPanel;