import React, { createContext, useState, useEffect, useContext } from 'react';
import { SearchContextProps } from '../types/context/SearchContext';

export const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  const addToSearchHistory = (term: string) => {
    let updatedHistory = [...searchHistory];
    updatedHistory = updatedHistory.filter((item) => item !== term);
    updatedHistory.unshift(term);
    updatedHistory = updatedHistory.slice(0, 15);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);
  };

  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  return (
    <SearchContext.Provider
      value={{ searchTerm, setSearchTerm, searchHistory, addToSearchHistory, clearSearchHistory }}
    >
      {children}
    </SearchContext.Provider>
  );
};
