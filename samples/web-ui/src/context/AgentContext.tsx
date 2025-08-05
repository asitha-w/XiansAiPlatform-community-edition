import React, { createContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { Bot as Agent } from '../types';
import { setGlobalAgentContext, setAgentContext, type AgentContextType } from '../utils/agentUtils';

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Register the context with utils for useAgent hook
setAgentContext(AgentContext);

interface AgentProviderProps {
  children: ReactNode;
  agents: Agent[];
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children, agents }) => {
  const [currentAgent, setCurrentAgentState] = useState<Agent | null>(null);
  const location = useLocation();

  const setCurrentAgent = useCallback((agent: Agent | null) => {
    setCurrentAgentState(agent);
  }, []);

  // Update current agent based on URL changes
  useEffect(() => {
    const currentPath = location.pathname.slice(1); // Remove leading slash
    const agentSlug = currentPath ? currentPath.split('/')[0] : undefined;
    const agent = agentSlug ? agents.find(agent => agent.slug === agentSlug) || null : null;
    
    console.log(`[AgentContext] 🎯 Current agent updated: ${agent?.name} for path: ${currentPath}`);
    setCurrentAgentState(agent);
  }, [location.pathname, agents]);

  const getCurrentFlow = useCallback((): string | null => {
    return currentAgent?.flow || null;
  }, [currentAgent]);

  const value: AgentContextType = useMemo(() => ({
    currentAgent,
    setCurrentAgent,
    agents,
    getCurrentFlow,
  }), [currentAgent, setCurrentAgent, agents, getCurrentFlow]);

  // Expose context to global functions for service access
  useEffect(() => {
    setGlobalAgentContext(value);
  }, [value]);

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};