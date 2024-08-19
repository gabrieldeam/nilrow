import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Cards = () => {
    return (
        <div>
            <Helmet>
                <title>Cartões - Nilrow</title>
                <meta name="description" content="Veja todos os cartões salvos na sua conta Nilrow." />
            </Helmet>
            <h1>Cartões</h1>
        </div>
    );
};

export default memo(Cards);
