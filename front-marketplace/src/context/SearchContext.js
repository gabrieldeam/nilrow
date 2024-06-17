import React, { createContext, useState, useContext, useEffect } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setSearchHistory(history);
    }, []);

    const addToSearchHistory = (term) => {
        let updatedHistory = [...searchHistory];
        updatedHistory = updatedHistory.filter(item => item !== term); // Remover duplicatas
        updatedHistory.unshift(term); // Adicionar ao início
        updatedHistory = updatedHistory.slice(0, 15); // Limitar a 15 itens
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory);
    };

    const clearSearchHistory = () => {
        localStorage.removeItem('searchHistory');
        setSearchHistory([]);
    };

    return (
        <SearchContext.Provider value={{ searchTerm, setSearchTerm, searchHistory, addToSearchHistory, clearSearchHistory }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
