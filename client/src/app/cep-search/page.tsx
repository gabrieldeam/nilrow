"use client";

import React, {
  useState,
  useCallback,
  memo,
  ChangeEvent,
  FormEvent,
} from "react";
import Head from "next/head";
import CustomInput from "@/components/UI/CustomInput/CustomInput";
import StageButton from "@/components/UI/StageButton/StageButton";
import Card from "@/components/UI/Card/Card";
import SeeData from "@/components/UI/SeeData/SeeData";
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import { useLocation } from "@/hooks/useLocation";
import styles from "./cepSearch.module.css";

interface CepResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const CepSearch: React.FC = () => {
  const [uf, setUf] = useState("");
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [results, setResults] = useState<CepResult[]>([]);
  const [error, setError] = useState("");
  const { setLocation } = useLocation();

  const handleUfChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUf(e.target.value);
    },
    []
  );

  const handleCityChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCity(e.target.value);
    },
    []
  );

  const handleStreetChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setStreet(e.target.value);
    },
    []
  );

  const handleSearchSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!uf || !city || !street) {
        setError("Por favor, preencha todos os campos.");
        setResults([]);
        return;
      }

      try {
        const apiUrl = `https://viacep.com.br/ws/${uf}/${city}/${street}/json/`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Erro ao buscar resultados.");
        }

        const data = await response.json();

        if (!data || (Array.isArray(data) && data.length === 0)) {
          setError("Nenhum resultado encontrado.");
          setResults([]);
        } else {
          setError("");
          // Caso retorne um objeto único, encapsula-o em um array
          setResults(Array.isArray(data) ? data : [data]);
        }
      } catch {
        setError("Erro ao buscar resultados. Tente novamente.");
        setResults([]);
      }
    },
    [uf, city, street]
  );

  const handleUseCep = useCallback(
    (cep: string, localidade: string, uf: string) => {
      setLocation({
        city: localidade,
        state: uf,
        latitude: 0,
        longitude: 0,
        zip: cep,
      });
    },
    [setLocation]
  );

  return (
    <div className={styles.zipCodeSearchPage}>
      <Head>
        <title>Buscar CEP - Nilrow</title>
        <meta name="description" content="Veja seu perfil na Nilrow." />
      </Head>
      {isMobile && <MobileHeader title="Buscar CEP" buttons={{ close: false }} />}
      <div className={styles.zipCodeSearchContainer}>
        <div className={styles.zipCodeSearchHeader}>
          <form
            onSubmit={handleSearchSubmit}
            className={styles.zipCodeSearchForm}
          >
            <h1 className={`${styles.zipCodeSearchTitle} roboto-medium`}>
              Buscar CEP
            </h1>
            <CustomInput
              title="UF"
              type="text"
              value={uf}
              onChange={handleUfChange}
            />
            <CustomInput
              title="Cidade"
              type="text"
              value={city}
              onChange={handleCityChange}
            />
            <CustomInput
              title="Logradouro"
              type="text"
              value={street}
              onChange={handleStreetChange}
            />
            <div className={styles.zipCodeSearchSubmit}>
              <StageButton
                text="Pesquisar"
                type="submit"
                backgroundColor="#7B33E5"
              />
            </div>
          </form>
        </div>
        <div className={styles.zipCodeSearchResults}>
          <Card title="Resultados">
            {error && <p className={styles.zipCodeSearchError}>{error}</p>}
            {!error && results.length === 0 && (
              <div className={styles.zipCodeSearchNoResults}>
                <p>Nenhum resultado encontrado.</p>
              </div>
            )}
            <div className={styles.seeDataContainerWrapper}>
              {results.map((result, index) => (
                <SeeData
                  key={index}
                  title={result.cep}
                  content={`${result.logradouro} - ${result.bairro} - ${result.localidade}/${result.uf}`}
                  link="#"
                  linkText="Usar CEP"
                  onClick={() =>
                    handleUseCep(result.cep, result.localidade, result.uf)
                  }
                  stackContent={true}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default memo(CepSearch);
