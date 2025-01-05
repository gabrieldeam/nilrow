import { useContext } from 'react';
import { LocationContext } from '../context/LocationContext';
import { LocationContextProps } from '../types/context/LocationContext';

export const useLocation = (): LocationContextProps => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
