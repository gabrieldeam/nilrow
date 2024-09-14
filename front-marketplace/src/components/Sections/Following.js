import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Following.css';
import getConfig from '../../config';
import rightArrow from '../../assets/rightarrow.svg';
import { getMyFollowingChannels } from '../../services/channelApi';
import './Sections.css';

const Following = () => {
  const { apiUrl, frontUrl } = getConfig();
  const navigate = useNavigate();
  const followingListRef = useRef(null);

  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Use refs to keep track of isLoading and hasMore without causing re-renders
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Use a ref to ensure initial load happens only once
  const initialLoadRef = useRef(false);

  const loadChannels = useCallback(
    async (currentPage) => {
      if (isLoadingRef.current || !hasMoreRef.current) return;

      setIsLoading(true);

      try {
        const response = await getMyFollowingChannels(currentPage, 10);

        setChannels((prevChannels) => {
          const combinedChannels = [...prevChannels, ...response];

          // Remove duplicates based on channel ID
          const uniqueChannels = combinedChannels.filter(
            (channel, index, self) =>
              index === self.findIndex((c) => c.id === channel.id)
          );

          return uniqueChannels;
        });

        if (response.length < 10) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Erro ao carregar canais seguidos:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [] // Keep dependencies empty
  );

  // Load channels on component mount
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadChannels(0);
    }
  }, [loadChannels]);

  // Handle scroll for loading more channels
  const handleScroll = useCallback(() => {
    if (followingListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = followingListRef.current;

      // Only proceed if content is scrollable
      if (scrollWidth <= clientWidth) {
        return;
      }

      if (
        scrollLeft + clientWidth >= scrollWidth - 50 &&
        !isLoading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, [isLoading, hasMore]);

  // Load more channels when page number increases
  useEffect(() => {
    if (page > 0) {
      loadChannels(page);
    }
  }, [page, loadChannels]);

  // Add scroll event listener
  useEffect(() => {
    const ref = followingListRef.current;

    if (ref) {
      ref.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (ref) {
        ref.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Render followed channels
  const renderFollowingChannels = () => {
    return channels.length > 0 ? (
      channels.map((channel) => (
        <a
          href={`${frontUrl}${channel.nickname}`}
          key={channel.id}
          className="following-channel-item"
        >
          <img
            src={`${apiUrl}${channel.imageUrl}`}
            alt={channel.name}
            className="channel-image-following"
          />
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
        <button
          onClick={() => navigate('/my-following')}
          className="following-button"
        >
          <img src={rightArrow} alt="Following" className="right-arrow-icon" />
        </button>
      </div>
      <div className="following-channel">
        <div className="following-channel-content" ref={followingListRef}>
          {renderFollowingChannels()}
        </div>
      </div>
      <div className="posts-following-channel">Posts dos Canais Seguidos</div>
    </div>
  );
};

export default Following;
