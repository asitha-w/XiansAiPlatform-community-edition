import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import theme from './utils/theme';
import HomePage from './pages/HomePage';
import BotPage from './pages/BotPage';
import Navbar from './components/Navbar';
import type { Bot as Agent } from './types';
import { ContractEntityPanel } from './features/legal/components/contract-entity/ContractEntityPanel';
import { DataMessageProvider } from './context/DataMessageContext';
import { AgentProvider } from './context/AgentContext';
import { useAgent } from './utils/agentUtils';


// Mock agents data - centralized for the entire app
const agents: Agent[] = [
  {
    id: '1',
    name: 'Legal Assistant',
    description: 'Legal analysis and contract management',
    capabilities: ['Contract Creation', 'Legal Analysis'],
    bot: 'Legal Contract Agent:Legal Contract Bot',
    flow: 'Legal Contract Agent:Legal Contract Flow',
    slug: 'legal',
    mainComponent: ContractEntityPanel,
  },
  {
    id: '2',
    name: 'Sales Assistant',
    description: 'Helps with orders and customer management',
    capabilities: ['Order Processing', 'Customer Analysis'],
    bot: 'Sales Agent:Sales Bot',
    slug: 'sales',
  },
  {
    id: '3',
    name: 'Finance Advisor',
    description: 'Financial analysis and invoice management',
    capabilities: ['Invoice Review', 'Financial Analysis'],
    bot: 'Finance Agent:Finance Bot',
    slug: 'finance',
  },
];

// App content component that uses agent context
function AppContent() {
  const navigate = useNavigate();
  const { currentAgent, agents } = useAgent();

  const handleAgentSelect = (agent: Agent) => {
    navigate(`/${agent.slug}`);
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FAFAFA'
    }}>
      <Navbar
        currentAgent={currentAgent || undefined}
        availableAgents={agents}
        onSelectAgent={handleAgentSelect}
      />

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        backgroundColor: '#F9FAFB',
        overflow: 'auto',
        paddingTop: '90px' // Push content below fixed navbar (64px toolbar + 48px py:3 + 1px border)
      }}>
        <Routes>
          <Route
            path="/"
            element={<HomePage agents={agents} />}
          />
          <Route
            path="/:slug"
            element={
              <BotPage
                agents={agents}
                onSelectAgent={handleAgentSelect}
              />
            }
          />
          <Route
            path="/:slug/new"
            element={
              <BotPage
                agents={agents}
                onSelectAgent={handleAgentSelect}
              />
            }
          />
          <Route
            path="/:slug/:documentId"
            element={
              <BotPage
                agents={agents}
                onSelectAgent={handleAgentSelect}
              />
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AgentProvider agents={agents}>
        <DataMessageProvider>
          <AppContent />
        </DataMessageProvider>
      </AgentProvider>
    </ThemeProvider>
  );
}

export default App;
