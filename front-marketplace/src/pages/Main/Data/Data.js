import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Data = () => {
    return (
        <div>
            <Helmet>
                <title>Dados - Nilrow</title>
                <meta name="description" content="Veja seus dados na Nilrow." />
            </Helmet>
            <h1>Data</h1>
        </div>
    );
};

export default memo(Data);
