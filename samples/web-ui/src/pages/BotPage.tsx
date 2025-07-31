import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ChatPanel from '../components/platform/ChatPanel';
import { RouteProvider } from '../context/RouteContext';
import { useRoute } from '../hooks/useRoute';
import type { Agent } from '../types';

interface BotPageProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  mode?: 'new' | 'document';
}

const BotPage: React.FC<BotPageProps> = ({ agents, mode }) => {
  const { slug } = useParams<{ slug: string; documentId?: string }>();
  
  // Find the agent by slug
  const currentAgent = agents.find(agent => agent.slug === slug);
  
  // If agent not found, redirect to home
  if (!currentAgent) {
    return <Navigate to="/" replace />;
  }

  // Wrap everything in RouteProvider so ChatPanel can access route context
  return (
    <RouteProvider mode={mode}>
      <BotPageContent currentAgent={currentAgent} />
    </RouteProvider>
  );
};

// Separate component that has access to route context
const BotPageContent: React.FC<{ currentAgent: Agent }> = ({ currentAgent }) => {
  const { documentId } = useRoute();
  
  // Create chat panel (used in both layouts)
  // Note: ChatPanel will use the configured participant ID from SDK config
  // This enables shared conversation history when users access bot via URL route
  const chatPanel = (
    <ChatPanel 
      currentAgent={currentAgent}
    />
  );

  // Show agent component only if:
  // 1. Agent has a main component AND
  // 2. There's a documentId in the URL (meaning we're in document mode)
  const shouldShowAgentComponent = currentAgent.mainComponent && documentId;
  
  let agentComponent: React.ReactNode = undefined;
  if (shouldShowAgentComponent && currentAgent.mainComponent) {
    const MainComponent = currentAgent.mainComponent;
    agentComponent = <MainComponent />;
  }

  return (
    <MainLayout
      chatPanel={chatPanel}
      agentComponent={agentComponent}
    />
  );
};

export default BotPage;