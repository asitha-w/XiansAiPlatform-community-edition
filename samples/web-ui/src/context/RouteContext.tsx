import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { RouteContext } from './context';
import type { RouteContextType } from './context';

interface RouteProviderProps {
  children: React.ReactNode;
  mode?: 'new' | 'document';
}

export const RouteProvider: React.FC<RouteProviderProps> = ({ children, mode }) => {
  const { slug, documentId } = useParams<{ slug: string; documentId?: string }>();
  const location = useLocation();

  const routeMode: 'default' | 'new' | 'document' = 
    mode === 'new' ? 'new' : 
    mode === 'document' ? 'document' : 
    'default';

  const value: RouteContextType = {
    slug,
    documentId,
    mode: routeMode,
    pathname: location.pathname,
  };

  return (
    <RouteContext.Provider value={value}>
      {children}
    </RouteContext.Provider>
  );
};