import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Blocked = () => {
    return (
        <div>
            <Helmet>
                <title>Bloqueados - Nilrow</title>
                <meta name="description" content="Veja os usuários bloqueados na Nilrow." />
            </Helmet>
            <h1>Blocked</h1>
        </div>
    );
};

export default memo(Blocked);
