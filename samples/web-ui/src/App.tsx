import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import theme from './utils/theme';
import HomePage from './pages/HomePage';
import BotPage from './pages/BotPage';
import Navbar from './components/Navbar';
import type { Agent } from './types';
import { ContractEntityWithSteps } from './components/legal/contract-entity/ContractEntityWithSteps';
import { DataMessageProvider } from './context/DataMessageContext';

// Mock agents data - centralized for the entire app
const agents: Agent[] = [
  {
    id: '3',
    name: 'Legal Assistant',
    description: 'Legal analysis and contract management',
    capabilities: ['Contract Creation', 'Legal Analysis'],
    workflow: 'Legal Contract Agent:Legal Contract Bot',
    slug: 'legal',
    mainComponent: ContractEntityWithSteps,
  },
  {
    id: '1',
    name: 'Sales Assistant',
    description: 'Helps with orders and customer management',
    capabilities: ['Order Processing', 'Customer Analysis'],
    workflow: 'Sales Agent:Sales Bot',
    slug: 'sales',
  },
  {
    id: '2',
    name: 'Finance Advisor',
    description: 'Financial analysis and invoice management',
    capabilities: ['Invoice Review', 'Financial Analysis'],
    workflow: 'Finance Agent:Finance Bot',
    slug: 'finance',
  },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAgentSelect = (agent: Agent) => {
    navigate(`/${agent.slug}`);
  };

  // Determine current agent based on URL
  const currentPath = location.pathname.slice(1); // Remove leading slash
  const currentAgent = currentPath ? agents.find(agent => agent.slug === currentPath) : undefined;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataMessageProvider>
        <Box sx={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#FAFAFA'
        }}>
          <Navbar 
            currentAgent={currentAgent}
            availableAgents={agents}
            onSelectAgent={handleAgentSelect}
          />

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, backgroundColor: '#F9FAFB' }}>
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
                    mode="new"
                  />
                } 
              />
              <Route 
                path="/:slug/:documentId" 
                element={
                  <BotPage 
                    agents={agents} 
                    onSelectAgent={handleAgentSelect}
                    mode="document"
                  />
                } 
              />
            </Routes>
          </Box>
        </Box>
      </DataMessageProvider>
    </ThemeProvider>
  );
}

export default App;
