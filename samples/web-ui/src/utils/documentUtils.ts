import { useContext } from 'react';
import DocumentContext from '../context/DocumentContext';

// Global document context for non-React service access
export interface DocumentContextType {
  documentId: string | null;
}

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

let globalDocumentContext: DocumentContextType | null = null;

export const setGlobalDocumentContext = (context: DocumentContextType) => {
  globalDocumentContext = context;
};

export const getCurrentDocumentIdGlobal = (): string | null => {
  return globalDocumentContext?.documentId || null;
};