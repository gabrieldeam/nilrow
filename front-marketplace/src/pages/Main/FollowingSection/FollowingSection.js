import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FollowingSection.css';
import getConfig from '../../../config';
import rightArrow from '../../../assets/rightarrow.svg';
import arrowIcon from '../../../assets/setadireito.svg'; 

const Following = ({ channels }) => {
    const { apiUrl, frontUrl } = getConfig();
    const navigate = useNavigate();
    const followingListRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    useEffect(() => {
        handleScroll();
    }, [channels]);

    const handleScroll = () => {
        if (followingListRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = followingListRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
        }
    };

    const handleScrollRight = () => {
        if (followingListRef.current) {
            followingListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const handleScrollLeft = () => {
        if (followingListRef.current) {
            followingListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const renderFollowingChannels = () => {
        return Array.isArray(channels) && channels.length > 0 ? (
            channels.map(channel => (
                <a href={`${frontUrl}${channel.nickname}`} key={channel.id} className="following-channel-item">
                    <img src={`${apiUrl}${channel.imageUrl}`} alt={channel.name} className="channel-image-following" />
                    <div className="channel-name-following">{channel.name}</div>
                </a>
            ))
        ) : (
            <div>No channels found</div>
        );
    };

    return (
        <div className="following-channel-section-content">
            <div className="following-channel-header">            
                <div className="following-title">Canais que você segue</div>
                <button onClick={() => navigate('/my-following')} className="following-button">
                    <img src={rightArrow} alt="Following" className="right-arrow-icon" />
                </button>
            </div>
            <div className="following-channel">
                {showLeftArrow && (
                    <div className="scroll-arrow-following scroll-arrow-left-following" onClick={handleScrollLeft}>
                        <img src={arrowIcon} alt="Scroll Left" />
                    </div>
                )}
                <div className="following-channel-content" ref={followingListRef} onScroll={handleScroll}>
                    {renderFollowingChannels()}
                </div>
                {showRightArrow && (
                    <div className="scroll-arrow-following scroll-arrow-right-following" onClick={handleScrollRight}>
                        <img src={arrowIcon} alt="Scroll Right" />
                    </div>
                )}
            </div>
            <div className="posts-following-channel">
                Posts dos Canais Seguidos
            </div>
        </div>
    );
};

export default Following;
