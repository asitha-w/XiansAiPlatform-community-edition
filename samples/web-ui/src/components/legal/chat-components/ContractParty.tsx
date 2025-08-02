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

interface ContractPartyProps {
  properties: Record<string, unknown>;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Contact {
  email: string;
  phone: string;
}

interface Representative {
  name: string;
  title: string;
}

interface PartyData {
  role: string;
  name: string;
  address: Address;
  contact: Contact;
  representative: Representative;
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

const ContractParty: React.FC<ContractPartyProps> = ({ properties }) => {
  const command = properties.command as string;
  const [open, setOpen] = useState(false);
  const [partyData, setPartyData] = useState<PartyData>({
    role: '',
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contact: {
      email: '',
      phone: '',
    },
    representative: {
      name: '',
      title: '',
    },
  });
  


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form data
    setPartyData({
      role: '',
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      contact: {
        email: '',
        phone: '',
      },
      representative: {
        name: '',
        title: '',
      },
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

  const handleNestedInputChange = (section: 'address' | 'contact' | 'representative', field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPartyData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.value,
      },
    }));
  };

  const handleDone = () => {
    // Create formatted message for the agent with structured data
    const message = `${command} Contract Party - Please ${command.toLowerCase()} the following party to the current contract:

**Party Details:**
- **Name:** ${partyData.name}
- **Role:** ${partyData.role}

**Address:**
- **Street:** ${partyData.address.street}
- **City:** ${partyData.address.city}
- **State:** ${partyData.address.state}
- **Zip Code:** ${partyData.address.zipCode}
- **Country:** ${partyData.address.country}

**Contact Information:**
- **Email:** ${partyData.contact.email}
- **Phone:** ${partyData.contact.phone}

**Representative:**
- **Name:** ${partyData.representative.name}
- **Title:** ${partyData.representative.title}

Please update the contract document to include this party with their specified role and contact information.`;

    // Send message to chat using generic SendChat event
    const sendChatEvent = new CustomEvent('SendChat', {
      detail: {
        message: message,
        data: {
          command,
          party: partyData
        }
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
          {command} a party to the contract
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpen}
        >
          {command} Party
        </Button>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{command} Contract Party</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the details for the contract party below. Required fields are marked with *.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Party Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Party Information</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
            </Box>

            {/* Address Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Address</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Street"
                  value={partyData.address.street}
                  onChange={handleNestedInputChange('address', 'street')}
                  margin="dense"
                  helperText="Street address"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={partyData.address.city}
                    onChange={handleNestedInputChange('address', 'city')}
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="State"
                    value={partyData.address.state}
                    onChange={handleNestedInputChange('address', 'state')}
                    margin="dense"
                  />
                  <TextField
                    label="Zip Code"
                    value={partyData.address.zipCode}
                    onChange={handleNestedInputChange('address', 'zipCode')}
                    margin="dense"
                    sx={{ width: '120px' }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Country"
                  value={partyData.address.country}
                  onChange={handleNestedInputChange('address', 'country')}
                  margin="dense"
                />
              </Box>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={partyData.contact.email}
                  onChange={handleNestedInputChange('contact', 'email')}
                  margin="dense"
                  helperText="Contact email address"
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={partyData.contact.phone}
                  onChange={handleNestedInputChange('contact', 'phone')}
                  margin="dense"
                  helperText="Contact phone number"
                />
              </Box>
            </Box>

            {/* Representative Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Representative</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Representative Name"
                  value={partyData.representative.name}
                  onChange={handleNestedInputChange('representative', 'name')}
                  margin="dense"
                  helperText="Name of the authorized representative"
                />
                <TextField
                  fullWidth
                  label="Title"
                  value={partyData.representative.title}
                  onChange={handleNestedInputChange('representative', 'title')}
                  margin="dense"
                  helperText="Representative's title or position"
                />
              </Box>
            </Box>
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

export default ContractParty;
