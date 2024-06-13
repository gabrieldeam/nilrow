import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
    return (
        <div>
            <Helmet>
                <title>Privacidade - Nilrow</title>
                <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
            </Helmet>
            <h1>Privacidade</h1>
        </div>
    );
};

export default memo(Privacy);
