import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const AboutChannel = () => {
    return (
        <div>
            <Helmet>
                <title>Sobre o canal</title>
                <meta name="description" content="Veja os usuários bloqueados na Nilrow." />
            </Helmet>
            <h1>BSobre</h1>
        </div>
    );
};

export default memo(AboutChannel);
