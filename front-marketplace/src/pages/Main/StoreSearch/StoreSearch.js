import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const StoreSearch = () => {
    return (
        <div>
            <Helmet>
                <title>Pesquisar loja</title>
                <meta name="description" content="Veja os usuários bloqueados na Nilrow." />
            </Helmet>
            <h1>Pesquisar loja</h1>
        </div>
    );
};

export default memo(StoreSearch);
