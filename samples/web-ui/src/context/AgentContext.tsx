import React, { createContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { Bot as Agent } from '../types';
import { setGlobalAgentContext, setAgentContext, getCurrentAgentGlobal, type AgentContextType } from '../utils/agentUtils';

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Register the context with utils for useAgent hook
setAgentContext(AgentContext);

interface AgentProviderProps {
  children: ReactNode;
  agents: Agent[];
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children, agents }) => {
  const location = useLocation();

  // Initialize agent synchronously based on current URL
  const getAgentFromPath = useCallback((pathname: string): Agent | null => {
    const currentPath = pathname.slice(1); // Remove leading slash
    const agentSlug = currentPath ? currentPath.split('/')[0] : undefined;
    return agentSlug ? agents.find(agent => agent.slug === agentSlug) || null : null;
  }, [agents]);

  // Initialize with current URL immediately (synchronous)
  const [currentAgent, setCurrentAgentState] = useState<Agent | null>(() => {
    const initialAgent = getAgentFromPath(location.pathname);
    console.log(`[AgentContext] 🚀 Initial agent set: ${initialAgent?.name} for path: ${location.pathname}`);
    return initialAgent;
  });

  const setCurrentAgent = useCallback((agent: Agent | null) => {
    setCurrentAgentState(agent);
  }, []);

  // Update current agent based on URL changes
  useEffect(() => {
    const agent = getAgentFromPath(location.pathname);
    
    // Only update if different to avoid unnecessary re-renders
    if (agent !== currentAgent) {
      console.log(`[AgentContext] 🎯 Current agent updated: ${agent?.name} for path: ${location.pathname}`);
      setCurrentAgentState(agent);
    }
  }, [location.pathname, getAgentFromPath, currentAgent]);

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
  // Set it immediately (synchronously) when value changes
  useEffect(() => {
    setGlobalAgentContext(value);
    console.log(`[AgentContext] 🌐 Global context updated: ${value.currentAgent?.name}`);
  }, [value]);

  // Also set global context immediately during render if we have an agent
  // This ensures global context is available synchronously
  if (currentAgent && getCurrentAgentGlobal() !== currentAgent) {
    setGlobalAgentContext(value);
  }

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};