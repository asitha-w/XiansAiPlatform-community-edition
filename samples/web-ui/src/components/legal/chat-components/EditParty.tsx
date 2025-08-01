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
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface EditPartyProps {
  properties: Record<string, unknown>;
}

interface PartyData {
  name: string;
  role: string;
  email: string;
  organization: string;
  address: string;
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
  'Other'
];

const EditParty: React.FC<EditPartyProps> = () => {
  const [open, setOpen] = useState(false);
  const [partyData, setPartyData] = useState<PartyData>({
    name: '',
    role: '',
    email: '',
    organization: '',
    address: '',
  });
  


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form data
    setPartyData({
      name: '',
      role: '',
      email: '',
      organization: '',
      address: '',
    });
  };

  const handleInputChange = (field: keyof PartyData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPartyData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDone = () => {
    // Create formatted message for the agent
    const message = `Please add the following party to the current contract:

**Party Details:**
- **Name:** ${partyData.name}
- **Role:** ${partyData.role}
- **Email:** ${partyData.email}
- **Organization:** ${partyData.organization}
- **Address:** ${partyData.address}

Please update the contract document to include this party with their specified role and contact information.`;

    // Send message to chat using generic SendChat event
    const sendChatEvent = new CustomEvent('SendChat', {
      detail: {
        message: message,
      }
    });
    
    window.dispatchEvent(sendChatEvent);

    handleClose();
  };

  const isFormValid = partyData.name.trim() && partyData.role.trim();

  return (
    <>
      <Box sx={{ my: 1 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Add a new party to the contract
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpen}
        >
          Add Party
        </Button>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Contract Party</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the details for the new contract party below. Required fields are marked with *.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Name *"
                value={partyData.name}
                onChange={handleInputChange('name')}
                margin="dense"
                helperText="Full legal name of the party"
              />
              <TextField
                fullWidth
                select
                label="Role *"
                value={partyData.role}
                onChange={handleInputChange('role')}
                margin="dense"
                helperText="Party's role in the contract"
              >
                {partyRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={partyData.email}
                onChange={handleInputChange('email')}
                margin="dense"
                helperText="Contact email address"
              />
              <TextField
                fullWidth
                label="Organization"
                value={partyData.organization}
                onChange={handleInputChange('organization')}
                margin="dense"
                helperText="Company or organization name"
              />
            </Box>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={partyData.address}
              onChange={handleInputChange('address')}
              margin="dense"
              helperText="Physical or mailing address"
            />
          </Box>
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
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditParty;
