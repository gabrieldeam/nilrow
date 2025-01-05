export interface SearchContextProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchHistory: string[];
    addToSearchHistory: (term: string) => void;
    clearSearchHistory: () => void;
  }
  