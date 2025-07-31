import { useContext } from 'react';
import { DataMessageContext } from '../context/context';

export const useDataMessage = () => {
  const context = useContext(DataMessageContext);
  if (context === undefined) {
    throw new Error('useDataMessage must be used within a DataMessageProvider');
  }
  return context;
};