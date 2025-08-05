import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ChatPanel from '../components/chat/ChatPanel';
import { DocumentProvider } from '../context/DocumentContext';
import type { Bot } from '../types';

interface BotPageProps {
  agents: Bot[];
  onSelectAgent: (agent: Bot) => void;
}

const BotPage: React.FC<BotPageProps> = ({ agents }) => {
  const { slug, documentId } = useParams<{ slug: string; documentId?: string }>();
  
  // Find the agent by slug
  const currentAgent = agents.find(agent => agent.slug === slug);
  
  console.log(`[BotPage] 🔄 Render - slug: ${slug} agent: ${currentAgent?.name} documentId: ${documentId}`);
  
  // If agent not found, redirect to home
  if (!currentAgent) {
    return <Navigate to="/" replace />;
  }
  
  // Direct access to route params, no RouteProvider needed
  return (
    <DocumentProvider>
      <BotPageContent currentAgent={currentAgent} documentId={documentId} agents={agents} />
    </DocumentProvider>
  );
};

// Separate component that has access to route context  
const BotPageContent: React.FC<{ currentAgent: Bot; documentId?: string; agents: Bot[] }> = React.memo(({ currentAgent, documentId, agents }) => {
  console.log(`[BotPageContent] 🔄 Render - agent: ${currentAgent?.name} id: ${currentAgent?.id} docId: ${documentId}`);
  console.log(`[BotPageContent] 🧪 React.memo wrapped component rendering`);
  
  // Create chat panel with memoization to persist across document navigation
  // Recreates when agent ID changes OR when documentId changes (including to/from /new route)
  // Note: ChatPanel will use the configured participant ID from SDK config
  // This enables proper conversation history management when switching between routes
  const chatPanel = useMemo(() => {
    console.log(`[BotPageContent] 🔧 Creating new ChatPanel for agent: ${currentAgent?.name} id: ${currentAgent?.id} documentId: ${documentId}`);
    return (
      <ChatPanel 
        currentAgent={currentAgent}
        documentId={documentId}
      />
    );
  }, [currentAgent, documentId]); // Depend on agent object and documentId

  // Show agent component only if:
  // 1. Agent has a main component AND
  // 2. There's a documentId in the URL (meaning we're in document mode)
  const shouldShowAgentComponent = currentAgent.mainComponent && documentId;
  
  let agentComponent: React.ReactNode = undefined;
  if (shouldShowAgentComponent && currentAgent.mainComponent) {
    const MainComponent = currentAgent.mainComponent as React.ComponentType<{ agents: Bot[] }>;
    agentComponent = <MainComponent agents={agents} />;
  }

  return (
    <MainLayout
      chatPanel={chatPanel}
      agentComponent={agentComponent}
    />
  );
}, (prevProps, nextProps) => {
  // Re-render if agent changes OR if documentId changes OR if agents array changes
  const agentChanged = prevProps.currentAgent !== nextProps.currentAgent;
  const documentChanged = prevProps.documentId !== nextProps.documentId;
  const agentsChanged = prevProps.agents !== nextProps.agents;
  const shouldSkipRender = !agentChanged && !documentChanged && !agentsChanged;
  console.log(`[BotPageContent] 🔍 React.memo comparison - prev agent: ${prevProps.currentAgent?.id} next agent: ${nextProps.currentAgent?.id} prev doc: ${prevProps.documentId} next doc: ${nextProps.documentId} shouldSkip: ${shouldSkipRender}`);
  console.log(`[BotPageContent] 🔍 React.memo comparison function called!`);
  return shouldSkipRender;
});

export default BotPage;