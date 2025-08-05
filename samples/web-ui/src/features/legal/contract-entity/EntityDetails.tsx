import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Article as TermsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { ContractEntity, ContractValidation, Contract, TermCategory, Party } from '../../../types';
import { FieldWithValidations } from './components/FieldWithValidations';
import { ValidationAlert } from './components/ValidationAlert';
import { sendMessageToAgent } from './utils/chatUtils';

export interface EntityDetailsProps {
  entity?: ContractEntity | null;
  contractData?: Contract | null;
  validations?: ContractValidation[];
  isEditing?: boolean;
  onContractChange?: (contractData: Contract) => void;
}

const EntityDetails: React.FC<EntityDetailsProps> = ({
  entity: propEntity,
  contractData: propContractData,
  validations: propValidations = [],
  isEditing = false,
  onContractChange,
}) => {
  const [entity, setEntity] = useState<ContractEntity | null>(propEntity || null);
  const [editableContract, setEditableContract] = useState<Contract | null>(null);

  // Use props for contract data and validations, fallback to entity data if props not provided
  const contractData = propContractData || entity?.data?.contract || null;
  const validations = propValidations.length > 0 ? propValidations : entity?.data?.validations || [];

  // Update entity when prop changes
  useEffect(() => {
    if (propEntity) {
      setEntity(propEntity);
    }
  }, [propEntity]);

  // Initialize editable contract when edit mode starts or contract data changes
  useEffect(() => {
    if (isEditing && contractData) {
      setEditableContract({ ...contractData });
    } else if (!isEditing) {
      setEditableContract(null);
    }
  }, [isEditing, contractData]);

  // Helper function to update editable contract and notify parent
  const updateEditableContract = (updates: Partial<Contract>) => {
    if (!editableContract) return;
    
    const updatedContract = { ...editableContract, ...updates };
    setEditableContract(updatedContract);
    onContractChange?.(updatedContract);
  };

  // Helper functions for managing parties and terms in edit mode
  const addParty = () => {
    if (!editableContract) return;
    
    const newParty = {
      id: crypto.randomUUID(),
      role: '',
      name: '',
      representatives: [],
      signatories: [],
    };
    
    updateEditableContract({
      parties: [...editableContract.parties, newParty]
    });
  };

  const removeParty = (partyId: string) => {
    if (!editableContract) return;
    
    updateEditableContract({
      parties: editableContract.parties.filter(p => p.id !== partyId)
    });
  };

  const updateParty = (partyId: string, updates: Partial<Party>) => {
    if (!editableContract) return;
    
    updateEditableContract({
      parties: editableContract.parties.map(p => 
        p.id === partyId ? { ...p, ...updates } : p
      )
    });
  };

  const addTerm = () => {
    if (!editableContract) return;
    
    const newTerm = {
      id: crypto.randomUUID(),
      category: 'General' as TermCategory,
      text: '',
    };
    
    updateEditableContract({
      terms: [...editableContract.terms, newTerm]
    });
  };

  const removeTerm = (termId: string) => {
    if (!editableContract) return;
    
    updateEditableContract({
      terms: editableContract.terms.filter(t => t.id !== termId)
    });
  };

  const updateTerm = (termId: string, updates: Partial<{ category: TermCategory; text: string }>) => {
    if (!editableContract) return;
    
    updateEditableContract({
      terms: editableContract.terms.map(t => 
        t.id === termId ? { ...t, ...updates } : t
      )
    });
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



  // Use editable contract in edit mode, otherwise use original contract data
  const displayContract = isEditing ? editableContract : contractData;

  if (!displayContract && !entity) {
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
      {displayContract && (
          <Box sx={{ p: 3, pt: 4 }}>
            {/* Contract Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                Description
              </Typography>
              <FieldWithValidations 
                fieldPath="description"
                validations={validations}
                onAskAgent={sendMessageToAgent}
              >
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={displayContract.description || ''}
                    onChange={(e) => updateEditableContract({ description: e.target.value })}
                    placeholder="Enter contract description..."
                    variant="outlined"
                  />
                ) : displayContract.description ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {displayContract.description}
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
              <FieldWithValidations 
                fieldPath="effectiveDate"
                validations={validations}
                onAskAgent={sendMessageToAgent}
              >
                {isEditing ? (
                  <TextField
                    type="date"
                    value={displayContract.effectiveDate ? displayContract.effectiveDate.split('T')[0] : ''}
                    onChange={(e) => updateEditableContract({ 
                      effectiveDate: e.target.value ? new Date(e.target.value).toISOString() : null 
                    })}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 200 }}
                  />
                ) : displayContract.effectiveDate ? (
                  <Typography variant="body1">
                    {new Date(displayContract.effectiveDate).toLocaleDateString()}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 20 }} />
                  Parties
                </Typography>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addParty}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    Add Party
                  </Button>
                )}
              </Box>
              <FieldWithValidations 
                fieldPath="parties"
                validations={validations}
                onAskAgent={sendMessageToAgent}
              >
                {displayContract.parties && displayContract.parties.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {displayContract.parties.map((party, index) => (
                      <Card key={party.id || index} variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              {isEditing ? (
                                <Box sx={{ display: 'grid', gap: 2, mb: 2 }}>
                                  <TextField
                                    label="Party Name"
                                    value={party.name || ''}
                                    onChange={(e) => updateParty(party.id, { name: e.target.value })}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                  />
                                  <TextField
                                    label="Role"
                                    value={party.role || ''}
                                    onChange={(e) => updateParty(party.id, { role: e.target.value })}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                  />
                                </Box>
                              ) : (
                                <>
                                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                                    {party.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Role: {party.role}
                                  </Typography>
                                </>
                              )}
                            </Box>
                            {isEditing && (
                              <IconButton 
                                onClick={() => removeParty(party.id)}
                                size="small"
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>

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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TermsIcon sx={{ fontSize: 20 }} />
                  Terms & Conditions
                </Typography>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addTerm}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    Add Term
                  </Button>
                )}
              </Box>
              <FieldWithValidations 
                fieldPath="terms"
                validations={validations}
                onAskAgent={sendMessageToAgent}
              >
                {displayContract.terms && displayContract.terms.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {displayContract.terms.map((term, index) => (
                      <Card key={term.id || index} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Term #{index + 1}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isEditing ? (
                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                  <Select
                                    value={term.category}
                                    onChange={(e) => updateTerm(term.id, { category: e.target.value as TermCategory })}
                                  >
                                    <MenuItem value="General">General</MenuItem>
                                    <MenuItem value="Payment">Payment</MenuItem>
                                    <MenuItem value="Delivery">Delivery</MenuItem>
                                    <MenuItem value="Warranty">Warranty</MenuItem>
                                    <MenuItem value="Liability">Liability</MenuItem>
                                    <MenuItem value="Termination">Termination</MenuItem>
                                    <MenuItem value="Confidentiality">Confidentiality</MenuItem>
                                    <MenuItem value="Intellectual_Property">Intellectual Property</MenuItem>
                                    <MenuItem value="Dispute_Resolution">Dispute Resolution</MenuItem>
                                    <MenuItem value="Compliance">Compliance</MenuItem>
                                  </Select>
                                </FormControl>
                              ) : (
                                <Chip
                                  label={getTermCategoryLabel(term.category)}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                              {isEditing && (
                                <IconButton 
                                  onClick={() => removeTerm(term.id)}
                                  size="small"
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                          {isEditing ? (
                            <TextField
                              multiline
                              rows={4}
                              fullWidth
                              value={term.text || ''}
                              onChange={(e) => updateTerm(term.id, { text: e.target.value })}
                              placeholder="Enter term content..."
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {term.text}
                            </Typography>
                          )}
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
                      <ValidationAlert 
                        key={index} 
                        validation={validation} 
                        onAskAgent={sendMessageToAgent}
                      />
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