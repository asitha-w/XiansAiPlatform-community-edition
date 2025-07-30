import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ChatOnlyLayout from '../layouts/ChatOnlyLayout';
import ChatPanel from '../components/platform/ChatPanel';
import type { Agent } from '../types';

interface BotPageProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
}

const BotPage: React.FC<BotPageProps> = ({ agents }) => {
  const { slug } = useParams<{ slug: string }>();
  
  // Find the agent by slug
  const currentAgent = agents.find(agent => agent.slug === slug);
  
  // If agent not found, redirect to home
  if (!currentAgent) {
    return <Navigate to="/" replace />;
  }

  // Create chat panel (used in both layouts)
  const chatPanel = (
    <ChatPanel 
      currentAgent={currentAgent}
    />
  );

  // If agent has a main component, use full layout
  if (currentAgent.mainComponent) {
    return (
      <MainLayout
        chatPanel={chatPanel}
        agentComponent={currentAgent.mainComponent}
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