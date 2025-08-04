import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Article as TermsIcon,
} from '@mui/icons-material';
import type { ContractEntity, ContractValidation, Contract, TermCategory } from '../../../types';

export interface EntityDetailsProps {
  entity?: ContractEntity | null;
  contractData?: Contract | null;
  validations?: ContractValidation[];
}

const EntityDetails: React.FC<EntityDetailsProps> = ({
  entity: propEntity,
  contractData: propContractData,
  validations: propValidations = [],
}) => {
  const [entity, setEntity] = useState<ContractEntity | null>(propEntity || null);

  // Use props for contract data and validations, fallback to entity data if props not provided
  const contractData = propContractData || entity?.data?.contract || null;
  const validations = propValidations.length > 0 ? propValidations : entity?.data?.validations || [];

  // Update entity when prop changes
  useEffect(() => {
    if (propEntity) {
      setEntity(propEntity);
    }
  }, [propEntity]);

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
    return null;
  }

  return (
    <Box sx={{ 
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
    }}>
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
  );
};

export default EntityDetails;