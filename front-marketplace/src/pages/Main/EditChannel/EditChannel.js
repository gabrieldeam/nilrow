import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const EditChannel= () => {
    return (
        <div>
            <Helmet>
                <title>Editar canal</title>
                <meta name="description" content="Edite seu canal de divulgação" />
            </Helmet>
            <h1>Canal</h1>
        </div>
    );
};

export default memo(EditChannel);
