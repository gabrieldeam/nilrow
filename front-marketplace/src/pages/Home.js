import React, { memo } from 'react';
import { Helmet } from 'react-helmet';

const Home = () => {
    return (
        <div>
            <Helmet>
                <title>Home - Nilrow</title>
                <meta name="description" content="Welcome to the Nilrow home page." />
            </Helmet>
            <h1>Home</h1>
        </div>
    );
};

export default memo(Home);
