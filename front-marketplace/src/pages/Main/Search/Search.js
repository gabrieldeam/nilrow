import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';

const Search = () => {

    const isMobile = window.innerWidth <= 768;

    return (
        <div>
            <Helmet>
                <title>Pesquisa - Nilrow</title>
                <meta name="description" content="Veja seu perfil na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader 
                    showSearch={true}
                    searchPlaceholder="Pesquisar..."
                    buttons={{ address: true, scan: true }}
                />
            )}
            <h1>Search Page</h1>
        </div>
    );
};

export default Search;
