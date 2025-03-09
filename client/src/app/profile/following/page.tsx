'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import CustomButton from '@/components/UI/CustomButton/CustomButton';
import HeaderButton from '@/components/UI/HeaderButton/HeaderButton';
import Image from 'next/image';
import closeIcon from '../../../../public/assets/close.svg';
import { getMyFollowingChannels, unfollowChannel } from '@/services/channel/followService';
import styles from './MyFollowing.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || "";

// Define a interface para os dados do canal
interface ChannelData {
  id: string;
  name: string;
  nickname: string;
  imageUrl: string;
}

const MyFollowing = () => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  const fetchChannels = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = (await getMyFollowingChannels(page, 10)) as ChannelData[];
      if (response.length === 0) {
        setHasMore(false);
      } else {
        setChannels(prevChannels => {
          // Filtra duplicatas verificando os IDs
          const newChannels = response.filter((newChannel: ChannelData) =>
            !prevChannels.some(channel => channel.id === newChannel.id)
          );
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

  const handleUnfollow = async (channelId: string) => {
    try {
      await unfollowChannel(channelId);
      setChannels(prevChannels => prevChannels.filter(channel => channel.id !== channelId));
    } catch (error) {
      console.error("Error unfollowing channel", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      if (hasMore && !loading && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className={styles.myFollowingPage}>
      <Head>
        <title>My Following</title>
        <meta name="description" content="Veja suas curtidas na Nilrow." />
      </Head>

      {isMobile && (
        <MobileHeader title="Seguindo" buttons={{ close: true }} handleBack={handleBack} />
      )}

      <div className={styles.myFollowingContainer}>
        <div className={styles.myFollowingSearchContainer}>
          {!isMobile && (
            <HeaderButton 
              icon={closeIcon} 
              onClick={handleBack} 
              className={styles.myFollowingDesktopOnly}
            />
          )}
          <input 
            type="text" 
            placeholder="Search channels..." 
            value={searchQuery} 
            onChange={handleSearch} 
            className={styles.myFollowingSearchInput}
          />
        </div>

        <div className={isMobile ? styles.channelsListMobileMyFollowing : styles.channelsListDesktopMyFollowing}>
          {filteredChannels.map((channel, index) => (
            <div key={`${channel.id}-${index}`} className={styles.channelItemMyFollowing}>
              <button 
                className={styles.channelInfoMyFollowing} 
                onClick={() => router.push(`${frontUrl}${channel.nickname}`)}
              >
                <Image 
                  src={`${apiUrl}${channel.imageUrl}`} 
                  alt={channel.name} 
                  className={styles.channelImageMyFollowing}
                  width={60} 
                  height={60} 
                />
                <div className={styles.channelDetailsMyFollowing}>
                  <span className={styles.channelNameMyFollowing}>{channel.name}</span>
                  <span className={styles.channelNicknameMyFollowing}>@{channel.nickname}</span>
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
