import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './utils/theme';
import MainLayout from './layouts/MainLayout';
import ChatPanel from './components/organisms/ChatPanel';
import BusinessEntityPanel from './components/organisms/BusinessEntityPanel';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout
        chatPanel={<ChatPanel />}
        entityPanel={<BusinessEntityPanel />}
      />
    </ThemeProvider>
  );
}

export default App;
