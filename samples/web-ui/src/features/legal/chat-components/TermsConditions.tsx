import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Alert,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GavelIcon from '@mui/icons-material/Gavel';

interface TermsConditionsProps {
  properties: Record<string, unknown>;
}

interface ContractTerm {
  id: string;
  type: string;
  category: 'financial' | 'obligation' | 'legal' | 'general';
  label: string;
  value: string | number | boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'currency';
  required: boolean;
}

// Predefined common terms by category
const PREDEFINED_TERMS: Record<string, ContractTerm[]> = {
  financial: [
    {
      id: 'payment_amount',
      type: 'payment',
      category: 'financial',
      label: 'Payment Amount',
      value: '',
      dataType: 'currency',
      required: true,
    },
    {
      id: 'payment_due_date',
      type: 'payment',
      category: 'financial',
      label: 'Payment Due Date',
      value: '',
      dataType: 'date',
      required: true,
    },
    {
      id: 'late_fee',
      type: 'penalty',
      category: 'financial',
      label: 'Late Payment Fee',
      value: '',
      dataType: 'currency',
      required: false,
    },
    {
      id: 'interest_rate',
      type: 'financial',
      category: 'financial',
      label: 'Interest Rate (%)',
      value: '',
      dataType: 'number',
      required: false,
    },
    {
      id: 'currency',
      type: 'financial',
      category: 'financial',
      label: 'Currency',
      value: 'USD',
      dataType: 'string',
      required: true,
    }
  ],
  obligation: [
    {
      id: 'delivery_date',
      type: 'delivery',
      category: 'obligation',
      label: 'Delivery Date',
      value: '',
      dataType: 'date',
      required: true,
    },
    {
      id: 'completion_date',
      type: 'completion',
      category: 'obligation',
      label: 'Project Completion Date',
      value: '',
      dataType: 'date',
      required: true,
    },
    {
      id: 'performance_standards',
      type: 'performance',
      category: 'obligation',
      label: 'Performance Standards',
      value: '',
      dataType: 'string',
      required: true,
    },
    {
      id: 'reporting_frequency',
      type: 'reporting',
      category: 'obligation',
      label: 'Reporting Frequency',
      value: 'Monthly',
      dataType: 'string',
      required: false,
    },
    {
      id: 'maintenance_period',
      type: 'maintenance',
      category: 'obligation',
      label: 'Maintenance Period (months)',
      value: 12,
      dataType: 'number',
      required: false,
    }
  ],
  legal: [
    {
      id: 'governing_law',
      type: 'jurisdiction',
      category: 'legal',
      label: 'Governing Law',
      value: '',
      dataType: 'string',
      required: true,
    },
    {
      id: 'jurisdiction',
      type: 'jurisdiction',
      category: 'legal',
      label: 'Jurisdiction for Disputes',
      value: '',
      dataType: 'string',
      required: true,
    },
    {
      id: 'force_majeure',
      type: 'clause',
      category: 'legal',
      label: 'Force Majeure Clause',
      value: true,
      dataType: 'boolean',
      required: false,
    },
    {
      id: 'confidentiality',
      type: 'clause',
      category: 'legal',
      label: 'Confidentiality Required',
      value: true,
      dataType: 'boolean',
      required: true,
    },
    {
      id: 'arbitration',
      type: 'dispute_resolution',
      category: 'legal',
      label: 'Mandatory Arbitration',
      value: false,
      dataType: 'boolean',
      required: false,
    },
    {
      id: 'limitation_liability',
      type: 'liability',
      category: 'legal',
      label: 'Limitation of Liability',
      value: '',
      dataType: 'currency',
      required: false,
    }
  ],
  general: [
    {
      id: 'contract_duration',
      type: 'duration',
      category: 'general',
      label: 'Contract Duration (months)',
      value: 12,
      dataType: 'number',
      required: true,
    },
    {
      id: 'renewal_automatic',
      type: 'renewal',
      category: 'general',
      label: 'Automatic Renewal',
      value: false,
      dataType: 'boolean',
      required: false,
    },
    {
      id: 'termination_notice',
      type: 'termination',
      category: 'general',
      label: 'Termination Notice Period (days)',
      value: 30,
      dataType: 'number',
      required: true,
    },
    {
      id: 'modification_terms',
      type: 'modification',
      category: 'general',
      label: 'Terms Modification Process',
      value: 'Written agreement required',
      dataType: 'string',
      required: true,
    },
    {
      id: 'entire_agreement',
      type: 'clause',
      category: 'general',
      label: 'Entire Agreement Clause',
      value: true,
      dataType: 'boolean',
      required: true,
    }
  ],
};

const TermsConditions: React.FC<TermsConditionsProps> = ({ properties }) => {
  const command = (properties.command as string) || 'Add';
  const [open, setOpen] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<ContractTerm[]>([]);
  const [customTerm, setCustomTerm] = useState<ContractTerm>({
    id: '',
    type: '',
    category: 'general',
    label: '',
    value: '',
    dataType: 'string',
    required: false,
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowCustomForm(false);
    setEditingTermId(null);
    resetCustomTerm();
  };

  const resetCustomTerm = () => {
    setCustomTerm({
      id: '',
      type: '',
      category: 'general',
      label: '',
      value: '',
      dataType: 'string',
      required: false,
    });
  };

  const handleSelectPredefinedTerm = (term: ContractTerm) => {
    const termWithId = {
      ...term,
      id: `${term.id}_${Date.now()}`,
    };
    setSelectedTerms([...selectedTerms, termWithId]);
  };

  const handleRemoveTerm = (termId: string) => {
    setSelectedTerms(selectedTerms.filter(term => term.id !== termId));
  };

  const handleEditTerm = (termId: string) => {
    const term = selectedTerms.find(t => t.id === termId);
    if (term) {
      setCustomTerm(term);
      setEditingTermId(termId);
      setShowCustomForm(true);
    }
  };

  const handleAddCustomTerm = () => {
    if (!customTerm.label.trim() || !customTerm.type.trim()) {
      return;
    }

    const newTerm: ContractTerm = {
      ...customTerm,
      id: editingTermId || `custom_${Date.now()}`,
    };

    if (editingTermId) {
      setSelectedTerms(selectedTerms.map(term => 
        term.id === editingTermId ? newTerm : term
      ));
      setEditingTermId(null);
    } else {
      setSelectedTerms([...selectedTerms, newTerm]);
    }

    setShowCustomForm(false);
    resetCustomTerm();
  };

  const handleCustomTermChange = (field: keyof ContractTerm, value: any) => {
    setCustomTerm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTermValueChange = (termId: string, value: any) => {
    setSelectedTerms(selectedTerms.map(term =>
      term.id === termId ? { ...term, value } : term
    ));
  };

  const handleDone = () => {
    if (selectedTerms.length === 0) {
      return;
    }

    const message = `${command} Terms and Conditions - Please ${command.toLowerCase()} the following terms to the current contract:

**Selected Terms (${selectedTerms.length} total):**

${selectedTerms.map((term, index) => `
${index + 1}. **${term.label}** (${term.category})
   - Type: ${term.type}
   - Value: ${term.value}
   - Required: ${term.required ? 'Yes' : 'No'}
   - Data Type: ${term.dataType}`).join('\n')}

Please update the contract document to include these terms and conditions with their specified values and requirements.`;

    // Send message to chat using generic SendChat event
    const sendChatEvent = new CustomEvent('SendChat', {
      detail: {
        message: message,
        data: {
          command,
          terms: selectedTerms
        }
      }
    });
    
    window.dispatchEvent(sendChatEvent);
    handleClose();
  };

  const renderTermValue = (term: ContractTerm) => {
    switch (term.dataType) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(term.value)}
                onChange={(e) => handleTermValueChange(term.id, e.target.checked)}
              />
            }
            label={Boolean(term.value) ? 'Yes' : 'No'}
          />
        );
      case 'number':
      case 'currency':
        return (
          <TextField
            type="number"
            value={term.value}
            onChange={(e) => handleTermValueChange(term.id, e.target.value)}
            size="small"
            fullWidth
            InputProps={term.dataType === 'currency' ? { startAdornment: '$' } : undefined}
          />
        );
      case 'date':
        return (
          <TextField
            type="date"
            value={term.value}
            onChange={(e) => handleTermValueChange(term.id, e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        );
      default:
        return (
          <TextField
            value={term.value}
            onChange={(e) => handleTermValueChange(term.id, e.target.value)}
            size="small"
            fullWidth
            multiline={String(term.value).length > 50}
            maxRows={3}
          />
        );
    }
  };

  const isFormValid = selectedTerms.length > 0 && selectedTerms.every(term => 
    !term.required || (term.value !== '' && term.value !== null && term.value !== undefined)
  );

  return (
    <>
      <Box sx={{ my: 1 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {command} terms and conditions to the contract
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GavelIcon />}
          onClick={handleOpen}
        >
          {command} Terms & Conditions
        </Button>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{command} Terms and Conditions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select from predefined terms or create custom terms for your contract. Required fields are marked with *.
          </Typography>

          {/* Selected Terms Section */}
          {selectedTerms.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Selected Terms ({selectedTerms.length})
              </Typography>
              {selectedTerms.map((term) => (
                <Box key={term.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2">{term.label}</Typography>
                        {term.required && <Chip label="Required" size="small" color="error" />}
                        <Chip label={term.category} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Type: {term.type}
                      </Typography>
                      {renderTermValue(term)}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTerm(term.id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveTerm(term.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          {/* Custom Term Form */}
          {showCustomForm && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {editingTermId ? 'Edit Term' : 'Add Custom Term'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Label *"
                    value={customTerm.label}
                    onChange={(e) => handleCustomTermChange('label', e.target.value)}
                    helperText="Display name for this term"
                  />
                  <TextField
                    fullWidth
                    label="Type *"
                    value={customTerm.type}
                    onChange={(e) => handleCustomTermChange('type', e.target.value)}
                    helperText="Term type (e.g., payment, delivery, etc.)"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={customTerm.category}
                      label="Category"
                      onChange={(e) => handleCustomTermChange('category', e.target.value)}
                    >
                      <MenuItem value="financial">Financial</MenuItem>
                      <MenuItem value="obligation">Obligation</MenuItem>
                      <MenuItem value="legal">Legal</MenuItem>
                      <MenuItem value="general">General</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Data Type</InputLabel>
                    <Select
                      value={customTerm.dataType}
                      label="Data Type"
                      onChange={(e) => handleCustomTermChange('dataType', e.target.value)}
                    >
                      <MenuItem value="string">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="currency">Currency</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="boolean">Yes/No</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    label="Default Value"
                    value={customTerm.value}
                    onChange={(e) => handleCustomTermChange('value', e.target.value)}
                    type={customTerm.dataType === 'number' || customTerm.dataType === 'currency' ? 'number' : 'text'}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customTerm.required}
                        onChange={(e) => handleCustomTermChange('required', e.target.checked)}
                      />
                    }
                    label="Required"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={() => { setShowCustomForm(false); setEditingTermId(null); resetCustomTerm(); }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleAddCustomTerm}
                    disabled={!customTerm.label.trim() || !customTerm.type.trim()}
                  >
                    {editingTermId ? 'Update Term' : 'Add Term'}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Add Custom Term Button */}
          {!showCustomForm && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowCustomForm(true)}
                fullWidth
              >
                Add Custom Term
              </Button>
            </Box>
          )}

          {/* Predefined Terms by Category */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Predefined Terms
          </Typography>
          
          {Object.entries(PREDEFINED_TERMS).map(([category, terms]) => (
            <Accordion key={category} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                  {category} ({terms.length} terms)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {terms.map((term) => (
                    <Box 
                      key={term.id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {term.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Type: {term.type} | Data Type: {term.dataType}
                          {term.required && ' | Required'}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSelectPredefinedTerm(term)}
                        disabled={selectedTerms.some(selected => selected.label === term.label)}
                      >
                        {selectedTerms.some(selected => selected.label === term.label) ? 'Added' : 'Add'}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Validation Alert */}
          {selectedTerms.length > 0 && !isFormValid && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please fill in all required fields for the selected terms.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDone} 
            variant="contained"
            disabled={!isFormValid}
          >
            Done ({selectedTerms.length} terms)
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TermsConditions;
