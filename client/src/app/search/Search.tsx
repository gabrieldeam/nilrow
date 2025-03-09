"use client";

import React, {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import Head from "next/head";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import clockIcon from "../../../public/assets/clock.svg";
import arrowIcon from "../../../public/assets/setadireito.svg";
import { useSearch } from "@/hooks/useSearch";
import styles from "./Search.module.css";

const Search: React.FC = () => {
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    searchTerm,
    setSearchTerm,
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
  } = useSearch();
  const historyListRef = useRef<HTMLUListElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      const mockResults = [
        `Resultado 1 para "${query}"`,
        `Resultado 2 para "${query}"`,
        `Resultado 3 para "${query}"`,
      ];
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  }, [searchParams]);

  const handleScroll = () => {
    if (historyListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = historyListRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const handleScrollRight = () => {
    if (historyListRef.current) {
      historyListRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleScrollLeft = () => {
    if (historyListRef.current) {
      historyListRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const handleHistoryClick = (term: string): void => {
    setSearchTerm(term);
    router.push(`/search?q=${term}`);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: FormEvent<Element>): void => {
    e.preventDefault();
    if (searchTerm.trim()) {
      addToSearchHistory(searchTerm);
      router.push(`/search?q=${searchTerm}`);
    } else {
      router.push(`/search`);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [searchHistory]);

  return (
    <>
      <Head>
        <title>Pesquisar</title>
        <meta name="description" content="Veja seu perfil na Nilrow." />
      </Head>
      <div className={styles.searchPage}>
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
        <div className={styles.searchContainer}>
          {searchResults.length === 0 && searchHistory.length > 0 ? (
            <div className={styles.searchHistory}>
              {showLeftArrow && (
                <div
                  className={styles.scrollArrowLeft}
                  onClick={handleScrollLeft}
                >
                  <Image
                    src={arrowIcon}
                    alt="Scroll Left"
                    width={24}
                    height={24}
                  />
                </div>
              )}
              <ul ref={historyListRef} onScroll={handleScroll}>
                {searchHistory.map((term: string, index: number) => (
                  <li key={index} onClick={() => handleHistoryClick(term)}>
                    <Image
                      src={clockIcon}
                      alt="Clock Icon"
                      className={styles.clockIcon}
                      width={24}
                      height={24}
                    />
                    {term}
                  </li>
                ))}
                <li
                  className={styles.clearHistoryButton}
                  onClick={clearSearchHistory}
                >
                  Limpar histórico
                </li>
              </ul>
              {showRightArrow && (
                <div
                  className={styles.scrollArrowRight}
                  onClick={handleScrollRight}
                >
                  <Image
                    src={arrowIcon}
                    alt="Scroll Right"
                    width={24}
                    height={24}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className={styles.searchResults}>
              <h2>Resultados da Pesquisa</h2>
              <ul>
                {searchResults.map((result: string, index: number) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;
