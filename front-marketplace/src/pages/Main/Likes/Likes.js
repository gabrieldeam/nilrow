import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Likes = () => {
    return (
        <div>
            <Helmet>
                <title>Curtidas - Nilrow</title>
                <meta name="description" content="Veja suas curtidas na Nilrow." />
            </Helmet>
            <h1>Likes</h1>
        </div>
    );
};

export default memo(Likes);
