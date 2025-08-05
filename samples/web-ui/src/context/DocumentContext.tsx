import React, { createContext, useEffect, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { setGlobalDocumentContext, type DocumentContextType } from '../utils/documentUtils';

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const { documentId } = useParams<{ documentId?: string }>();

  const value: DocumentContextType = useMemo(() => ({
    documentId: documentId || null,
  }), [documentId]);

  // Expose context to global functions for service access
  useEffect(() => {
    setGlobalDocumentContext(value);
  }, [value]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentContext;