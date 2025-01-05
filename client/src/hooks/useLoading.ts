import { useContext } from 'react';
import { LoadingContext } from '../context/LoadingContext';
import { LoadingContextProps } from '../types/context/LoadingContext';

export const useLoading = (): LoadingContextProps => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
