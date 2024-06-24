import React, { useState, useEffect, memo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import CustomButton from '../../../components/UI/Buttons/CustomButton/CustomButton';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import { getMyFollowingChannels, unfollowChannel } from '../../../services/channelApi';
import getConfig from '../../../config';
import './MyFollowing.css';

const { apiUrl, frontUrl } = getConfig();

const MyFollowing = () => {
    const [channels, setChannels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const fetchChannels = useCallback(async (page) => {
        setLoading(true);
        try {
            const response = await getMyFollowingChannels(page, 10); // Assuming 10 channels per page
            if (response.length === 0) {
                setHasMore(false);
            } else {
                setChannels(prevChannels => {
                    // Eliminate potential duplicates by checking existing channel IDs
                    const newChannels = response.filter(newChannel => !prevChannels.some(channel => channel.id === newChannel.id));
                    return [...prevChannels, ...newChannels];
                });
            }
        } catch (error) {
            console.error("Error fetching channels", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChannels(page);
    }, [page, fetchChannels]);

    const handleUnfollow = async (channelId) => {
        try {
            await unfollowChannel(channelId);
            setChannels((prevChannels) => prevChannels.filter(channel => channel.id !== channelId));
        } catch (error) {
            console.error("Error unfollowing channel", error);
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const handleScroll = () => {
            if (hasMore && !loading && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
                setPage(prevPage => prevPage + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, loading]);

    return (
        <div className="my-following-page">
            <Helmet>
                <title>My Following</title>
                <meta name="description" content="Veja suas curtidas na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Seguindo" buttons={{ close: true }} handleBack={handleBack}/>
            )}
            <div className="my-following-container">
                <div className="my-following-search-container">
                    {!isMobile && (
                        <HeaderButton 
                            icon={closeIcon} 
                            onClick={handleBack} 
                            className="my-following-desktop-only"
                        />
                    )}
                    <input 
                        type="text" 
                        placeholder="Search channels..." 
                        value={searchQuery} 
                        onChange={handleSearch} 
                        className="my-following-search-input"
                    />
                </div>
                <div className={isMobile ? "channels-list-mobile-my-following" : "channels-list-desktop-my-following"}>
                    {filteredChannels.map((channel, index) => (
                        <div key={`${channel.id}-${index}`} className="channel-item-my-following">
                            <button className="channel-info-my-following" onClick={() => navigate(`${frontUrl}${channel.nickname}`)}>
                                <img src={`${apiUrl}${channel.imageUrl}`} alt={channel.name} className="channel-image-my-following" />
                                <div className="channel-details-my-following">
                                    <span className="channel-name-my-following">{channel.name}</span>
                                    <span className="channel-nickname-my-following">@{channel.nickname}</span>
                                </div>
                            </button>
                            <CustomButton 
                                title="Amigos" 
                                backgroundColor="#212121" 
                                onClick={() => handleUnfollow(channel.id)} 
                            />
                        </div>
                    ))}
                </div>
                {loading && <div>Loading...</div>}
                {!hasMore && <div>No more channels to load</div>}
            </div>
        </div>
    );
};

export default memo(MyFollowing);
