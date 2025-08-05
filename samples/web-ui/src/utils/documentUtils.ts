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

/**
 * Extract document ID directly from the current URL
 * URL pattern: /:slug/:documentId
 * @returns The document ID from the URL or null if not found
 */
export const getCurrentDocumentIdGlobal = (): string | null => {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering or non-browser environment
  }
  
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean); // Remove empty segments
  
  // Expected URL pattern: /:slug/:documentId
  // segments[0] = slug, segments[1] = documentId
  if (segments.length >= 2 && segments[1] !== 'new') {
    return segments[1];
  }
  
  return null;
};

// Legacy function kept for backward compatibility - no longer needed
export const setGlobalDocumentContext = (_context: DocumentContextType) => {
  // No-op: getCurrentDocumentIdGlobal now reads directly from URL
};