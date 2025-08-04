import React, { useState, useMemo } from 'react';
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
  IconButton,
  Stack,
  Paper,
  Tooltip,
  useTheme,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

interface ContractPartyProps {
  /**
   * Additional properties coming from the component registry. The only one we
   * rely on for now is the `command` (i.e. "Add" | "Edit") so the component
   * can be reused for both creating and editing a party.
   */
  properties: Record<string, unknown>;
}

/**
 * Person model mirroring the backend `Person` record.
 */
export interface PersonData {
  id: string;
  name: string;
  nationalId: string;
  title: string;
  email: string;
  phone: string;
}

/**
 * Party model mirroring the backend `Party` record.
 */
export interface PartyData {
  role: string;
  name: string;
  representatives: PersonData[];
  signatories: PersonData[];
}

/**
 * Internal state for the component using person IDs for selection
 */
interface PartyFormData {
  role: string;
  name: string;
  representativeIds: string[];
  signatoryIds: string[];
}



const partyRoles = [
  'Client',
  'Service Provider',
  'Contractor',
  'Subcontractor',
  'Vendor',
  'Buyer',
  'Seller',
  'Lessor',
  'Lessee',
  'Licensor',
  'Licensee',
  'Principal',
  'Agent',
  'Guarantor',
  'Witness',
  'Other',
];

/**
 * A minimalistic contract party editor designed with Nordic aesthetics in mind.
 * – Clean surfaces, generous whitespace and subtle borders.
 */
const ContractParty: React.FC<ContractPartyProps> = ({ properties }) => {
  const command = (properties.command as string) ?? 'Add';
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  // Extract Acquaintances from properties
  const acquaintances = useMemo(() => {
    const acquaintancesData = (properties.Acquaintances as { result?: PersonData[] })?.result;
    return Array.isArray(acquaintancesData) ? acquaintancesData : [];
  }, [properties]);

  // Slightly darker border color for inputs
  const inputBorderColor = theme.palette.grey[400];
  const inputBg = theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800];

  // Reusable style object for TextFields
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: inputBg,
      '& fieldset': {
        borderColor: inputBorderColor,
      },
      '&:hover fieldset': {
        borderColor: inputBorderColor,
      },
    },
  };

  const [partyFormData, setPartyFormData] = useState<PartyFormData>({
    role: '',
    name: '',
    representativeIds: [],
    signatoryIds: [],
  });

  // Helper functions to convert between IDs and full person objects
  const getPersonById = (id: string): PersonData | undefined => {
    return acquaintances.find(person => person.id === id);
  };

  const getSelectedPersons = (ids: string[]): PersonData[] => {
    return ids.map(getPersonById).filter(Boolean) as PersonData[];
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setPartyFormData({
      role: '',
      name: '',
      representativeIds: [],
      signatoryIds: [],
    });
  };

  /* ----------------------------------------------------
   * Basic field handlers
   * --------------------------------------------------*/
  const handleInputChange = (field: keyof Omit<PartyFormData, 'representativeIds' | 'signatoryIds'>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPartyFormData(prev => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  /* ----------------------------------------------------
   * Person selection handlers (representatives & signatories)
   * --------------------------------------------------*/
  const handlePersonSelection = (
    section: 'representativeIds' | 'signatoryIds',
    personId: string,
  ) => {
    setPartyFormData(prev => {
      const currentIds = prev[section];
      const isAlreadySelected = currentIds.includes(personId);
      
      if (isAlreadySelected) {
        // Remove if already selected
        return {
          ...prev,
          [section]: currentIds.filter(id => id !== personId),
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [section]: [...currentIds, personId],
        };
      }
    });
  };



  const removePerson = (section: 'representativeIds' | 'signatoryIds', personId: string) => () => {
    setPartyFormData(prev => ({
      ...prev,
      [section]: prev[section].filter(id => id !== personId),
    }));
  };

  /* ----------------------------------------------------
   * Submission
   * --------------------------------------------------*/
  const handleDone = () => {
    // Convert form data to final party data
    const representatives = getSelectedPersons(partyFormData.representativeIds);
    const signatories = getSelectedPersons(partyFormData.signatoryIds);

    const partyData: PartyData = {
      role: partyFormData.role,
      name: partyFormData.name,
      representatives,
      signatories,
    };

    // Compose a human-friendly chat message for the agent
    const messageLines: string[] = [
      `${command} Contract Party – Please ${command.toLowerCase()} the following party to the current contract:\n`,
      '**Party Details:**',
      `- **Name:** ${partyData.name}`,
      `- **Role:** ${partyData.role}`,
      '',
      '**Representatives:**',
      ...representatives.map((rep, idx) => {
        const fields = [`Representative Name: ${rep.name}`];
        if (rep.id?.trim()) fields.push(`ID: ${rep.id}`);
        if (rep.name?.trim()) fields.push(`Name: ${rep.name}`);
        return `   ${idx + 1}. ${fields.join(', ')}`;
      }),
      '',
      '**Signatories:**',
      ...signatories.map((sig, idx) => {
        const fields = [`Signatory Name: ${sig.name}`];
        if (sig.id?.trim()) fields.push(`ID: ${sig.id}`);
        if (sig.name?.trim()) fields.push(`Name: ${sig.name}`);
        return `   ${idx + 1}. ${fields.join(', ')}`;
      }),
      '',
      'Please update the contract document to include this party with the specified details.',
    ];

    const message = messageLines.join('\n');

    const sendChatEvent = new CustomEvent('SendChat', {
      detail: {
        message,
        data: {
          command,
          party: partyData,
        },
      },
    });

    window.dispatchEvent(sendChatEvent);
    handleClose();
  };

  const isFormValid = partyFormData.name.trim() !== '' && partyFormData.role.trim() !== '';

  /* ----------------------------------------------------
   * Render helpers
   * --------------------------------------------------*/
  const renderPeopleSection = (
    title: string,
    section: 'representativeIds' | 'signatoryIds',
  ) => {
    const selectedIds = partyFormData[section];
    const selectedPersons = getSelectedPersons(selectedIds);
    const availablePersons = acquaintances.filter(person => !selectedIds.includes(person.id));

    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>

        {/* Dropdown to select from available acquaintances */}
        {availablePersons.length > 0 && (
          <FormControl fullWidth size="small" sx={{ mb: 2, ...inputSx }}>
            <InputLabel>Select {title.slice(0, -1)}</InputLabel>
            <Select
              value=""
              label={`Select ${title.slice(0, -1)}`}
              onChange={(event) => {
                const personId = event.target.value as string;
                if (personId) {
                  handlePersonSelection(section, personId);
                }
              }}
            >
              {availablePersons.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.name} - {person.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Display selected persons */}
        <Stack spacing={2}>
          {selectedPersons.map((person) => (
            <Paper key={person.id} variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {person.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {person.title}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {person.email && (
                      <Typography variant="caption" color="text.secondary">
                        Email: {person.email}
                      </Typography>
                    )}
                    {person.phone && (
                      <Typography variant="caption" color="text.secondary">
                        Phone: {person.phone}
                      </Typography>
                    )}
                    {person.nationalId && (
                      <Typography variant="caption" color="text.secondary">
                        ID: {person.nationalId}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Tooltip title="Remove person">
                  <IconButton 
                    color="error" 
                    onClick={removePerson(section, person.id)} 
                    sx={{ ml: 1 }}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Stack>

        {selectedPersons.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
            No {title.toLowerCase()} selected. Use the dropdown above to add from available acquaintances.
          </Typography>
        )}
      </Box>
    );
  };

  /* ----------------------------------------------------
   * UI
   * --------------------------------------------------*/
  return (
    <>
      <Box sx={{ my: 1 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {command} a party to the contract
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpen}
          size="small"
        >
          {command} Party
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{command} Contract Party</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the details for the contract party below. Required fields are marked with *.
          </Typography>

          <Stack spacing={4}>
            {/* Basic Party Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Party Information
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                <TextField
                  label="Name *"
                  fullWidth
                  value={partyFormData.name}
                  onChange={handleInputChange('name')}
                  margin="dense"
                  size="small"
                  variant="outlined"
                  sx={{ flex: '1 1 240px', ...inputSx }}
                />
                <TextField
                  label="Role *"
                  select
                  fullWidth
                  value={partyFormData.role}
                  onChange={handleInputChange('role')}
                  margin="dense"
                  size="small"
                  variant="outlined"
                  sx={{ flex: '1 1 240px', ...inputSx }}
                >
                  {partyRoles.map(role => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Box>

            {/* Representatives */}
            {renderPeopleSection('Representatives', 'representativeIds')}

            {/* Signatories */}
            {renderPeopleSection('Signatories', 'signatoryIds')}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDone} variant="contained" disabled={!isFormValid}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContractParty;
