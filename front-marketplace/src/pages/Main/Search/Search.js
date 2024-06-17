import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import clockIcon from '../../../assets/clock.svg';
import arrowIcon from '../../../assets/setadireito.svg';
import { useSearch } from '../../../context/SearchContext';
import './Search.css';

const Search = () => {
    const isMobile = window.innerWidth <= 768;
    const [searchResults, setSearchResults] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { searchTerm, setSearchTerm, searchHistory, addToSearchHistory, clearSearchHistory } = useSearch();
    const historyListRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('q');
        if (query) {
            const mockResults = [
                `Resultado 1 para "${query}"`,
                `Resultado 2 para "${query}"`,
                `Resultado 3 para "${query}"`
            ];
            setSearchResults(mockResults);
        } else {
            setSearchResults([]);
        }
    }, [location.search]);

    const handleScroll = () => {
        if (historyListRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = historyListRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
        }
    };

    const handleScrollRight = () => {
        if (historyListRef.current) {
            historyListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const handleScrollLeft = () => {
        if (historyListRef.current) {
            historyListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const handleHistoryClick = (term) => {
        setSearchTerm(term);
        navigate(`/search?q=${term}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            addToSearchHistory(searchTerm);
            navigate(`/search?q=${searchTerm}`);
        } else {
            navigate(`/search`);
        }
    };

    useEffect(() => {
        handleScroll();
    }, [searchHistory]);

    return (
        <div className="search-page">
            <Helmet>
                <title>Pesquisar</title>
                <meta name="description" content="Veja seu perfil na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader 
                    showSearch={true}
                    searchPlaceholder="Pesquisar..."
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearchSubmit}
                    buttons={{ address: true, scan: true }}
                />
            )}
            <div className="search-container">
                {searchResults.length === 0 && searchHistory.length > 0 ? (
                    <div className="search-history">
                        {showLeftArrow && (
                            <div className="scroll-arrow scroll-arrow-left" onClick={handleScrollLeft}>
                                <img src={arrowIcon} alt="Scroll Left" />
                            </div>
                        )}
                        <ul ref={historyListRef} onScroll={handleScroll}>
                            {searchHistory.map((term, index) => (
                                <li key={index} onClick={() => handleHistoryClick(term)}>
                                    <img src={clockIcon} alt="Clock Icon" className="clock-icon" />
                                    {term}
                                </li>
                            ))}
                            <li className="clear-history-button roboto-regular" onClick={clearSearchHistory}>
                                Limpar histórico
                            </li>
                        </ul>
                        {showRightArrow && (
                            <div className="scroll-arrow scroll-arrow-right" onClick={handleScrollRight}>
                                <img src={arrowIcon} alt="Scroll Right" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="search-results">
                        <h2>Resultados da Pesquisa</h2>
                        <ul>
                            {searchResults.map((result, index) => (
                                <li key={index}>{result}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
