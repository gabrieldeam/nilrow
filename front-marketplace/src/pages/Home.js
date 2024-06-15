import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import FixedSlide from '../components/Others/FixedSlide/FixedSlide';
import MobileHeader from '../components/Main/MobileHeader/MobileHeader';

const Home = () => {
    const isMobile = window.innerWidth <= 768;

    return (
        <div>
            <Helmet>
                <title>Home - Nilrow</title>
                <meta name="description" content="Welcome to the Nilrow home page." />
            </Helmet>
            <FixedSlide />
            {isMobile && (
                <MobileHeader showLogo={true} buttons={{ address: true, bag: true }} />
            )}
            <h1>Home</h1>
        </div>
    );
};

export default memo(Home);
