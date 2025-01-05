import { useContext } from 'react';
import { SearchContext } from '../context/SearchContext';
import { SearchContextProps } from '../types/context/SearchContext';

export const useSearch = (): SearchContextProps => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
