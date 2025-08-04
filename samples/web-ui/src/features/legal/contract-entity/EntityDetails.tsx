import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Description as ContractIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Article as TermsIcon,
} from '@mui/icons-material';
import type { ContractEntity, ContractValidation, Contract, TermCategory } from '../../../types';
import { useParams } from 'react-router-dom';
import EntityOverview from './EntityOverview';

export interface EntityDetailsProps {
  entity?: ContractEntity | null;
  contractData?: Contract | null;
  validations?: ContractValidation[];
  onSave?: (entity: ContractEntity) => void;
  isEditing?: boolean;
  onRefreshDocument?: () => Promise<void>;
}

const EntityDetails: React.FC<EntityDetailsProps> = ({
  entity: propEntity,
  contractData: propContractData,
  validations: propValidations = [],
  onSave,
  isEditing = false,
  onRefreshDocument,
}) => {
  const [entity, setEntity] = useState<ContractEntity | null>(propEntity || null);
  const { documentId } = useParams<{ documentId?: string }>();

  // Use props for contract data and validations, fallback to entity data if props not provided
  const contractData = propContractData || entity?.data?.contract || null;
  const validations = propValidations.length > 0 ? propValidations : entity?.data?.validations || [];

  // Send chat message when documentId changes
  useEffect(() => {
    if (documentId) {
      // const message = `Please retrieve the status of this contract.`;

      // const sendChatEvent = new CustomEvent('SendChat', {
      //   detail: {
      //     message: message
      //   }
      // });

      // window.dispatchEvent(sendChatEvent);
    }
  }, [documentId]);

  // Update entity when prop changes
  useEffect(() => {
    if (propEntity) {
      setEntity(propEntity);
    }
  }, [propEntity]);



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'needs_attention':
        return 'error';
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

  const getValidationsForField = (fieldPath: string): ContractValidation[] => {
    return validations.filter(v => v.fieldPath === fieldPath);
  };

  const getSeverityIcon = (severity: number) => {
    switch (severity) {
      case 0: return <ErrorIcon color="error" sx={{ fontSize: 16 }} />;
      case 1: return <WarningIcon color="warning" sx={{ fontSize: 16 }} />;
      case 2: return <InfoIcon color="info" sx={{ fontSize: 16 }} />;
      default: return <InfoIcon color="info" sx={{ fontSize: 16 }} />;
    }
  };

  const getTermCategoryLabel = (category: TermCategory): string => {
    switch (category) {
      case 'General': return 'General';
      case 'Payment': return 'Payment';
      case 'Delivery': return 'Delivery';
      case 'Warranty': return 'Warranty';
      case 'Liability': return 'Liability';
      case 'Termination': return 'Termination';
      case 'Confidentiality': return 'Confidentiality';
      case 'Intellectual_Property': return 'Intellectual Property';
      case 'Dispute_Resolution': return 'Dispute Resolution';
      case 'Compliance': return 'Compliance';
      default: return 'General';
    }
  };

  const ValidationAlert: React.FC<{ validation: ContractValidation }> = ({ validation }) => (
    <Alert
      severity={validation.severity === 0 ? 'error' : validation.severity === 1 ? 'warning' : 'info'}
      sx={{
        mt: 1,
        fontSize: '0.875rem',
        '& .MuiAlert-message': { fontSize: '0.875rem' }
      }}
      icon={getSeverityIcon(validation.severity)}
    >
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {validation.message}
        </Typography>
        {validation.suggestedAction && (
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
            Suggestion: {validation.suggestedAction}
          </Typography>
        )}
      </Box>
    </Alert>
  );

  const FieldWithValidations: React.FC<{
    fieldPath: string;
    children: React.ReactNode;
  }> = ({ fieldPath, children }) => {
    const fieldValidations = getValidationsForField(fieldPath);

    return (
      <Box>
        {children}
        {fieldValidations.map((validation, index) => (
          <ValidationAlert key={index} validation={validation} />
        ))}
      </Box>
    );
  };

  if (!contractData && !entity) {
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        mt: 10,
        p: 4
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <ContractIcon sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            No Contract Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a contract to view details or wait for contract data to load
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1 }}>
        {/* Contract Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '0.5px solid',
                borderColor: 'grey.100'
              }}>
                <ContractIcon />
              </Box>
              <Box>
                <FieldWithValidations fieldPath="title">
                  <Typography variant="h4" sx={{ fontWeight: 400, mb: 0.5 }}>
                    {contractData?.title || entity?.title || 'Untitled Contract'}
                  </Typography>
                </FieldWithValidations>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {contractData?.id || entity?.id}
                  </Typography>
                  {entity && (
                    <Chip
                      label={entity.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(entity.status)}
                      variant="outlined"
                      sx={{
                        textTransform: 'capitalize',
                        borderColor: 'grey.200',
                        backgroundColor: 'grey.50'
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {!isEditing ? (
                <Button
                  startIcon={<RefreshIcon />}
                  size="small"
                  onClick={() => onRefreshDocument?.()}
                  variant="outlined"
                  sx={{ minWidth: 80 }}
                >
                  Refresh
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" color="success" onClick={() => entity && onSave?.(entity)}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <CancelIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, color: 'text.secondary' }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Created: {contractData?.createdDate ? new Date(contractData.createdDate).toLocaleDateString() : 'Unknown'}
            </Typography>
            {entity?.lastModified && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Last modified: {entity.lastModified.toLocaleDateString()}
              </Typography>
            )}
            {entity?.assignedTo && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Assigned to: {entity.assignedTo}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mx: 3, borderColor: 'grey.50' }} />

        {/* Entity Overview - Document Insights */}
        {contractData && (
          <Box sx={{ p: 3, pb: 2 }}>
            <EntityOverview
              validations={validations}
            />
          </Box>
        )}

        {contractData && (
          <Divider sx={{ mx: 3, borderColor: 'grey.50' }} />
        )}

        {/* Contract Content */}
        {contractData && (
          <Box sx={{ p: 3, pt: 4 }}>
            {/* Contract Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                Description
              </Typography>
              <FieldWithValidations fieldPath="description">
                {contractData.description ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {contractData.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No description provided
                  </Typography>
                )}
              </FieldWithValidations>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'grey.50' }} />

            {/* Effective Date */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 20 }} />
                Effective Date
              </Typography>
              <FieldWithValidations fieldPath="effectiveDate">
                {contractData.effectiveDate ? (
                  <Typography variant="body1">
                    {new Date(contractData.effectiveDate).toLocaleDateString()}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No effective date set
                  </Typography>
                )}
              </FieldWithValidations>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'grey.50' }} />

            {/* Contract Parties */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 20 }} />
                Parties
              </Typography>
              <FieldWithValidations fieldPath="parties">
                {contractData.parties && contractData.parties.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {contractData.parties.map((party, index) => (
                      <Card key={party.id || index} variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                            {party.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Role: {party.role}
                          </Typography>

                          {/* Representatives */}
                          {party.representatives && party.representatives.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
                                Representatives
                              </Typography>
                              {party.representatives.map((person, personIndex) => (
                                <Box key={person.id || personIndex} sx={{ ml: 2, mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {person.name} {person.title && `(${person.title})`}
                                  </Typography>
                                  {person.email && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Email: {person.email}
                                    </Typography>
                                  )}
                                  {person.phone && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Phone: {person.phone}
                                    </Typography>
                                  )}
                                  {person.nationalId && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      ID: {person.nationalId}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}

                          {/* Signatories */}
                          {party.signatories && party.signatories.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
                                Signatories
                              </Typography>
                              {party.signatories.map((person, personIndex) => (
                                <Box key={person.id || personIndex} sx={{ ml: 2, mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {person.name} {person.title && `(${person.title})`}
                                  </Typography>
                                  {person.email && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Email: {person.email}
                                    </Typography>
                                  )}
                                  {person.phone && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Phone: {person.phone}
                                    </Typography>
                                  )}
                                  {person.nationalId && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      ID: {person.nationalId}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No parties defined
                  </Typography>
                )}
              </FieldWithValidations>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'grey.50' }} />

            {/* Contract Terms */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TermsIcon sx={{ fontSize: 20 }} />
                Terms & Conditions
              </Typography>
              <FieldWithValidations fieldPath="terms">
                {contractData.terms && contractData.terms.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {contractData.terms.map((term, index) => (
                      <Card key={term.id || index} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Term #{index + 1}
                            </Typography>
                            <Chip
                              label={getTermCategoryLabel(term.category)}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {term.text}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No terms and conditions defined
                  </Typography>
                )}
              </FieldWithValidations>
            </Box>

            {/* Global Validations (for fields not displayed above) */}
            {validations.filter(v => !['title', 'description', 'effectiveDate', 'parties', 'terms'].includes(v.fieldPath)).length > 0 && (
              <>
                <Divider sx={{ my: 4, borderColor: 'grey.50' }} />
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                    Additional Validations
                  </Typography>
                  {validations
                    .filter(v => !['title', 'description', 'effectiveDate', 'parties', 'terms'].includes(v.fieldPath))
                    .map((validation, index) => (
                      <ValidationAlert key={index} validation={validation} />
                    ))}
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EntityDetails;