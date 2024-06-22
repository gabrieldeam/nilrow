import React, { useState, useEffect, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import CustomButton from '../../../components/UI/Buttons/CustomButton/CustomButton';
import closeIcon from '../../../assets/close.svg';
import { getFollowingChannels, getFollowers, isChannelOwner, isFollowing, followChannel, unfollowChannel } from '../../../services/channelApi';
import getConfig from '../../../config';
import userIcon from '../../../assets/user.png';
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
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const response = await getFollowers(nickname);
                setFollowers(response);
            } catch (error) {
                console.error("Error fetching followers", error);
            }
        };

        const fetchFollowingChannels = async () => {
            try {
                const response = await getFollowingChannels(nickname);
                setFollowingChannels(response);

                const ownerStatuses = {};
                const followingStatuses = {};

                for (const channel of response) {
                    const isOwner = await isChannelOwner(channel.id);
                    const isFollowingChannel = await isFollowing(channel.id);

                    ownerStatuses[channel.id] = isOwner;
                    followingStatuses[channel.id] = isFollowingChannel;
                }

                setOwnerChannels(ownerStatuses);
                setFollowingStatus(followingStatuses);
            } catch (error) {
                console.error("Error fetching following channels", error);
            }
        };

        fetchFollowers();
        fetchFollowingChannels();
    }, [nickname]);

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
                    {activeSection === 'followers' && filteredFollowers.map(follower => (
                        <div key={follower.id} className="channel-follow-item">
                            <button className="channel-follow-info2" onClick={() => navigate(`${frontUrl}${follower.nickname}`)}>
                                <img src={userIcon} alt={follower.name} className="channel-follow-image" />
                                <div className="channel-follow-details">
                                    <span className="channel-follow-name">{follower.name}</span>
                                    <span className="channel-follow-nickname">@{follower.nickname}</span>
                                </div>
                            </button>
                        </div>
                    ))}
                    {activeSection === 'following' && filteredFollowingChannels.map(channel => (
                        <div key={channel.id} className="channel-follow-item">
                            <button className="channel-follow-info2" onClick={() => navigate(`${frontUrl}${channel.nickname}`)}>
                                <img src={channel.imageUrl ? `${apiUrl}${channel.imageUrl}` : userIcon} alt={channel.name} className="channel-follow-image" />
                                <div className="channel-follow-details">
                                    <span className="channel-follow-name">{channel.name}</span>
                                    <span className="channel-follow-nickname">@{channel.nickname}</span>
                                </div>
                            </button>
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
            </div>
        </div>
    );
};

export default memo(ChannelFollow);
