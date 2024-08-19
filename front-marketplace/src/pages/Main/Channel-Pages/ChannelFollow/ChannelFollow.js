import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import HeaderButton from '../../../../components/UI/Buttons/HeaderButton/HeaderButton';
import CustomButton from '../../../../components/UI/Buttons/CustomButton/CustomButton';
import closeIcon from '../../../../assets/close.svg';
import { getFollowingChannels, getFollowers, isChannelOwner, isFollowing, followChannel, unfollowChannel } from '../../../../services/channelApi';
import getConfig from '../../../../config';
import userIcon from '../../../../assets/user.png';
import './ChannelFollow.css';

const { apiUrl, frontUrl } = getConfig();

const ChannelFollow = () => {
    const { nickname } = useParams();
    const [followers, setFollowers] = useState([]);
    const [followingChannels, setFollowingChannels] = useState([]);
    const [activeSection, setActiveSection] = useState('followers');
    const [searchQuery, setSearchQuery] = useState('');
    const [ownerChannels, setOwnerChannels] = useState({});
    const [followingStatus, setFollowingStatus] = useState({});
    const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
    const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const initialLoad = useRef(true); // Adicionando o useRef para controle de carregamento inicial

    const fetchFollowers = useCallback(async (nickname, page) => {
        setLoading(true);
        try {
            const response = await getFollowers(nickname, page, 10);
            if (response.length === 0) {
                setHasMoreFollowers(false);
            } else {
                setFollowers(prevFollowers => [...prevFollowers, ...response]);
            }
        } catch (error) {
            console.error("Error fetching followers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFollowingChannels = useCallback(async (nickname, page) => {
        setLoading(true);
        try {
            const response = await getFollowingChannels(nickname, page, 10);
            if (response.length === 0) {
                setHasMoreFollowing(false);
            } else {
                setFollowingChannels(prevFollowing => [...prevFollowing, ...response]);

                const ownerStatuses = {};
                const followingStatuses = {};

                for (const channel of response) {
                    const isOwner = await isChannelOwner(channel.id);
                    const isFollowingChannel = await isFollowing(channel.id);

                    ownerStatuses[channel.id] = isOwner;
                    followingStatuses[channel.id] = isFollowingChannel;
                }

                setOwnerChannels(prevOwnerChannels => ({ ...prevOwnerChannels, ...ownerStatuses }));
                setFollowingStatus(prevFollowingStatus => ({ ...prevFollowingStatus, ...followingStatuses }));
            }
        } catch (error) {
            console.error("Error fetching following channels", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }

        if (activeSection === 'followers') {
            setFollowers([]);
            setHasMoreFollowers(true);
            fetchFollowers(nickname, 0);
        } else if (activeSection === 'following') {
            setFollowingChannels([]);
            setHasMoreFollowing(true);
            fetchFollowingChannels(nickname, 0);
        }
    }, [activeSection, nickname, fetchFollowers, fetchFollowingChannels]);

    useEffect(() => {
        if (activeSection === 'followers' && initialLoad.current) {
            initialLoad.current = false;
            fetchFollowers(nickname, 0);
        }
    }, [activeSection, nickname, fetchFollowers]);

    const handleFollow = async (channelId) => {
        try {
            await followChannel(channelId);
            setFollowingStatus(prevState => ({ ...prevState, [channelId]: true }));
        } catch (error) {
            console.error("Error following channel", error);
        }
    };

    const handleUnfollow = async (channelId) => {
        try {
            await unfollowChannel(channelId);
            setFollowingStatus(prevState => ({ ...prevState, [channelId]: false }));
        } catch (error) {
            console.error("Error unfollowing channel", error);
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredFollowers = followers.filter(follower =>
        follower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFollowingChannels = followingChannels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (loading) return;

            if (window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight) {
                if (activeSection === 'followers' && hasMoreFollowers) {
                    fetchFollowers(nickname, followers.length / 10);
                } else if (activeSection === 'following' && hasMoreFollowing) {
                    fetchFollowingChannels(nickname, followingChannels.length / 10);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loading, activeSection, hasMoreFollowers, hasMoreFollowing, fetchFollowers, fetchFollowingChannels, nickname, followers.length, followingChannels.length]);

    return (
        <div className="channel-follow-page">
            <Helmet>
                <title>{`Channel Follow - ${nickname}`}</title>
                <meta name="description" content={`Veja os seguidores e os canais que ${nickname} segue na Nilrow.`} />
            </Helmet>
            {isMobile && (
                <MobileHeader title={`@${nickname}`} buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="channel-follow-container">
                <div className="channel-follow-header">
                    <div className="channel-follow-buttons">
                        <button
                            className={`channel-follow-button ${activeSection === 'followers' ? 'active' : ''}`}
                            onClick={() => setActiveSection('followers')}
                        >
                            Seguidores
                        </button>
                        <button
                            className={`channel-follow-button ${activeSection === 'following' ? 'active' : ''}`}
                            onClick={() => setActiveSection('following')}
                        >
                            Seguindo
                        </button>
                    </div>
                    <div className="channel-follow-search-container">
                        {!isMobile && (
                            <HeaderButton
                                icon={closeIcon}
                                onClick={handleBack}
                                className="channel-follow-desktop-only"
                            />
                        )}
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="channel-follow-search-input"
                        />
                    </div>
                </div>
                <div className={isMobile ? "channel-follow-list-mobile" : "channel-follow-list-desktop"}>
                    {activeSection === 'followers' && filteredFollowers.map((follower, index) => (
                        <div key={`${follower.id}-${index}`} className="channel-follow-item">
                            <button className="channel-follow-info2">
                                <img src={userIcon} alt={follower.name} className="channel-follow-image" />
                                <div className="channel-follow-details">
                                    <span className="channel-follow-name">{follower.name}</span>
                                    <span className="channel-follow-nickname">@{follower.nickname}</span>
                                </div>
                            </button>
                        </div>
                    ))}
                    {activeSection === 'following' && filteredFollowingChannels.map((channel, index) => (
                        <div key={`${channel.id}-${index}`} className="channel-follow-item">
                            <a className="channel-follow-info2" href={`${frontUrl}${channel.nickname}`}>
                                <img src={channel.imageUrl ? `${apiUrl}${channel.imageUrl}` : userIcon} alt={channel.name} className="channel-follow-image" />
                                <div className="channel-follow-details">
                                    <span className="channel-follow-name">{channel.name}</span>
                                    <span className="channel-follow-nickname">@{channel.nickname}</span>
                                </div>
                            </a>
                            {ownerChannels[channel.id] ? (
                                <CustomButton 
                                    title="Editar Canal"
                                    backgroundColor="#212121"
                                    onClick={() => navigate(`/edit-channel/${channel.id}`)}
                                />
                            ) : followingStatus[channel.id] ? (
                                <CustomButton 
                                    title="Amigos"
                                    backgroundColor="#212121"
                                    onClick={() => handleUnfollow(channel.id)}
                                />
                            ) : (
                                <CustomButton 
                                    title="Seguir"
                                    backgroundColor="#DF1414"
                                    onClick={() => handleFollow(channel.id)}
                                />
                            )}
                        </div>
                    ))}
                </div>
                {loading && <div>Loading...</div>}
            </div>
        </div>
    );
};

export default memo(ChannelFollow);
