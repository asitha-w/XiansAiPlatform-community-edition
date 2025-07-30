import { createContext } from 'react';

export interface RouteContextType {
  slug?: string;
  documentId?: string;
  mode: 'default' | 'new' | 'document';
  pathname: string;
}

export const RouteContext = createContext<RouteContextType | undefined>(undefined);