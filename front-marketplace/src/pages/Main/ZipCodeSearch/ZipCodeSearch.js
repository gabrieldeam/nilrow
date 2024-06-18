import React, { useState, useContext, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import './ZipCodeSearch.css';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import { LocationContext } from '../../../context/LocationContext';

const ZipCodeSearch = () => {
    const [uf, setUf] = useState('');
    const isMobile = window.innerWidth <= 768;
    const [city, setCity] = useState('');
    const [street, setStreet] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const { setLocation } = useContext(LocationContext);

    const handleUfChange = useCallback((e) => {
        setUf(e.target.value);
    }, []);

    const handleCityChange = useCallback((e) => {
        setCity(e.target.value);
    }, []);

    const handleStreetChange = useCallback((e) => {
        setStreet(e.target.value);
    }, []);

    const handleSearchSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!uf || !city || !street) {
            setError('Por favor, preencha todos os campos.');
            setResults([]);
            return;
        }

        try {
            const apiUrl = `https://viacep.com.br/ws/${uf}/${city}/${street}/json/`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Erro ao buscar resultados.');
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                setError('Nenhum resultado encontrado.');
                setResults([]);
            } else {
                setError('');
                setResults(Array.isArray(data) ? data : [data]);
            }
        } catch (err) {
            setError('Erro ao buscar resultados. Tente novamente.');
            setResults([]);
        }
    }, [uf, city, street]);

    const handleUseCep = useCallback((cep, localidade, uf, logradouro, bairro) => {
        setLocation({
            city: localidade,
            state: uf,
            latitude: 0, // Substitua por dados reais se disponíveis
            longitude: 0, // Substitua por dados reais se disponíveis
            zip: cep,
        });
    }, [setLocation]);

    return (
        <div className="zip-code-search-page">
            <Helmet>
                <title>Buscar CEP - Nilrow</title>
                <meta name="description" content="Veja seu perfil na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Buscar CEP" buttons={{ close: false }} />
            )}
            <div className="zip-code-search-container">
                <div className="zip-code-search-header">
                    <form onSubmit={handleSearchSubmit} className="zip-code-search-form">
                        <h1 className="zip-code-search-title roboto-medium">Buscar CEP</h1>
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
                        <div className="zip-code-search-submit">
                            <StageButton text="Pesquisar" type="submit" backgroundColor="#7B33E5" />
                        </div>
                    </form>
                </div>
                <div className="zip-code-search-results">
                    <Card title="Resultados">
                        {error && <p className="zip-code-search-error">{error}</p>}
                        {!error && results.length === 0 && (
                            <div className="zip-code-search-no-results">
                                <p>Nenhum resultado encontrado.</p>
                            </div>
                        )}
                        <div className="see-data-container-wrapper">
                            {results.map((result, index) => (
                                <SeeData
                                    key={index}
                                    title={result.cep}
                                    content={`${result.logradouro} - ${result.bairro} - ${result.localidade}/${result.uf}`}
                                    link="#"
                                    linkText="Usar CEP"
                                    onClick={() => handleUseCep(result.cep, result.localidade, result.uf, result.logradouro, result.bairro)}
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

export default memo(ZipCodeSearch);
