import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { format, parseISO } from 'date-fns';

interface CalendarProps {
  properties: Record<string, unknown>;
}

const Calendar: React.FC<CalendarProps> = ({ properties }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const field = properties.field as string || 'date';

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDate('');
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleOk = () => {
    if (selectedDate) {
      const parsedDate = parseISO(selectedDate);
      const formattedDate = format(parsedDate, 'MMMM d, yyyy');
      
      const message = `I would like to set the ${field} to ${formattedDate}.`;

      // Send message to chat using generic SendChat event
      const sendChatEvent = new CustomEvent('SendChat', {
        detail: {
          message: message,
        }
      });
      
      window.dispatchEvent(sendChatEvent);
    }

    handleClose();
  };

  return (
    <>
      <Box sx={{ my: 1 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Please select the date for {field}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CalendarTodayIcon />}
          onClick={handleOpen}
        >
          Select Date
        </Button>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          Select {field}
          <IconButton 
            aria-label="close" 
            onClick={handleClose}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ py: 2 }}>
            <TextField
              fullWidth
              type="date"
              label={`Select ${field}`}
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              margin="dense"
              helperText={`Choose the ${field} from the calendar`}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleOk} 
            variant="contained"
            disabled={!selectedDate}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Calendar;