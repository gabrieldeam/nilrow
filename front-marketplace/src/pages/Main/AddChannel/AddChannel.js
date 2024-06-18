import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const AddChannel= () => {
    return (
        <div>
            <Helmet>
                <title>Criar canal</title>
                <meta name="description" content="Crie seu canal de divulgação" />
            </Helmet>
            <h1>Canal</h1>
        </div>
    );
};

export default memo(AddChannel);
