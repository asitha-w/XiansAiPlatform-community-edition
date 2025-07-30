import { ThemeProvider, CssBaseline } from '@mui/material';
import { useState } from 'react';
import theme from './utils/theme';
import MainLayout from './layouts/MainLayout';
import ChatPanel from './components/organisms/ChatPanel';
import BusinessEntityPanel from './components/organisms/BusinessEntityPanel';
import type { Agent } from './types';

// Mock agents data - same as in ChatPanel
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Sales Assistant',
    description: 'Helps with orders and customer management',
    capabilities: ['Order Processing', 'Customer Analysis'],
    isActive: true,
    category: 'sales',
  },
  {
    id: '2',
    name: 'Finance Advisor',
    description: 'Financial analysis and invoice management',
    capabilities: ['Invoice Review', 'Financial Analysis'],
    isActive: true,
    category: 'finance',
  },
];

function App() {
  const [currentAgent, setCurrentAgent] = useState<Agent>(mockAgents[0]);

  const handleAgentSelect = (agent: Agent) => {
    setCurrentAgent(agent);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout
        chatPanel={
          <ChatPanel 
            currentAgent={currentAgent}
          />
        }
        entityPanel={<BusinessEntityPanel />}
        currentAgent={currentAgent}
        availableAgents={mockAgents}
        onSelectAgent={handleAgentSelect}
      />
    </ThemeProvider>
  );
}

export default App;
