import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Channel= () => {
    return (
        <div>
            <Helmet>
                <title>Canal</title>
                <meta name="description" content="Canal de divulgação" />
            </Helmet>
            <h1>Canal</h1>
        </div>
    );
};

export default memo(Channel);
