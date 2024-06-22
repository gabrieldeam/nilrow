import React, { memo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import FixedSlide from '../components/Others/FixedSlide/FixedSlide';
import MobileHeader from '../components/Main/MobileHeader/MobileHeader';
import HomeSubHeader from '../components/Main/HomeSubHeader/HomeSubHeader';
import { getMyFollowingChannels } from '../services/channelApi'; // Import the API function
import './Home.css';

const Home = () => {
    const isMobile = window.innerWidth <= 768;
    const [activeSection, setActiveSection] = useState(null);
    const [followingChannels, setFollowingChannels] = useState([]);

    useEffect(() => {
        if (activeSection === 'following') {
            getMyFollowingChannels().then(response => {
                console.log("API Response:", response); // Log the full response object
                if (response) {
                    setFollowingChannels(response); // Directly setting the response as the response is already an array
                } else {
                    console.error("API response data is undefined");
                    setFollowingChannels([]);
                }
            }).catch(error => {
                console.error("Error fetching following channels", error);
                setFollowingChannels([]);
            });
        }
    }, [activeSection]);

    const handleButtonClick = (buttonType) => {
        setActiveSection(prevSection => prevSection === buttonType ? null : buttonType);
    };

    const renderFollowingChannels = () => {
        const baseUrl = 'http://localhost:8080/api'; // Replace with your actual base URL
        return Array.isArray(followingChannels) && followingChannels.length > 0 ? (
            followingChannels.map(channel => (
                <a href={`http://localhost:3000/@${channel.nickname}`} key={channel.id} className="following-channel-item">
                    <img src={`${baseUrl}${channel.imageUrl}`} alt={channel.name} className="channel-image-following" />
                    <div className="channel-name-following">{channel.name}</div>
                </a>
            ))
        ) : (
            <div>No channels found</div>
        );
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'ontherise':
                return <div className="section-content">Seção Em Alta</div>;
            case 'following':
                return (
                    <div className="section-content">
                        <div className="following-channel">
                            {renderFollowingChannels()}
                        </div>
                        <div className="posts-following-channel">
                            Posts dos Canais Seguidos
                        </div>
                    </div>
                );
            case 'curation':
                return <div className="section-content">Seção Curadoria</div>;
            default:
                return <div className="section-content">Seção Padrão</div>;
        }
    };

    return (
        <div className="home-page">
            <Helmet>
                <title>Home - Nilrow</title>
                <meta name="description" content="Welcome to the Nilrow home page." />
            </Helmet>
            <FixedSlide />
            {isMobile && (
                <MobileHeader showLogo={true} buttons={{ address: true, bag: true }} />
            )}
            <HomeSubHeader onButtonClick={handleButtonClick} />
            <div className="section-container">
                {renderSection()}
            </div>
        </div>
    );
};

export default memo(Home);
