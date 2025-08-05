import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  TextField,
  Paper,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, parseISO } from 'date-fns';

interface CalendarProps {
  properties: Record<string, unknown>;
}

const Calendar: React.FC<CalendarProps> = ({ properties }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const field = properties.field as string || 'date';

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleSubmit = () => {
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
      
      // Clear the selected date after sending
      setSelectedDate('');
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        my: 2, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h3">
          Select {field}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please choose the date for {field}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          type="date"
          label={`Select ${field}`}
          value={selectedDate}
          onChange={handleDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          helperText={`Choose the ${field} from the calendar`}
          sx={{ mb: 2 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!selectedDate}
          startIcon={<CalendarTodayIcon />}
        >
          Set Date
        </Button>
      </Box>
    </Paper>
  );
};

export default Calendar;