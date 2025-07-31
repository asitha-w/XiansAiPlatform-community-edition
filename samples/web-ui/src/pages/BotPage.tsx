import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ChatOnlyLayout from '../layouts/ChatOnlyLayout';
import ChatPanel from '../components/platform/ChatPanel';
import { RouteProvider } from '../context/RouteContext';
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
  // Create chat panel (used in both layouts)
  // Note: ChatPanel will use the configured participant ID from SDK config
  // This enables shared conversation history when users access bot via URL route
  const chatPanel = (
    <ChatPanel 
      currentAgent={currentAgent}
    />
  );

  // If agent has a main component, use full layout
  if (currentAgent.mainComponent) {
    const MainComponent = currentAgent.mainComponent;
    
    return (
      <MainLayout
        chatPanel={chatPanel}
        agentComponent={<MainComponent />}
      />
    );
  }

  // Otherwise, use chat-only centered layout
  return (
    <ChatOnlyLayout
      chatPanel={chatPanel}
    />
  );
};

export default BotPage;