'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Following.module.css';
import { getMyFollowingChannels } from '../../../../services/channel/followService';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';

const Following: React.FC = () => {
  const router = useRouter();
  const followingListRef = useRef<HTMLDivElement | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadChannels = useCallback(async (currentPage: number) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const response = await getMyFollowingChannels(currentPage, 10);
      setChannels((prev) => {
        const unique = [...prev, ...response].filter(
          (channel, index, self) => index === self.findIndex((c) => c.id === channel.id)
        );
        return unique;
      });

      if (response.length < 10) setHasMore(false);
    } catch (error) {
      console.error('Erro ao carregar canais seguidos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    loadChannels(0);
  }, [loadChannels]);

  const handleScroll = useCallback(() => {
    if (followingListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = followingListRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 50 && !isLoading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    if (page > 0) loadChannels(page);
  }, [page, loadChannels]);

  useEffect(() => {
    const ref = followingListRef.current;
    ref?.addEventListener('scroll', handleScroll);
    return () => ref?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const renderFollowingChannels = () =>
    channels.length ? (
      channels.map((channel) => (
        <a
          href={`${frontUrl}${channel.nickname}`}
          key={channel.id}
          className={styles.channelItem}
        >
          <Image
            src={`${apiUrl}${channel.imageUrl}`}
            alt={channel.name}
            width={60}
            height={60}
            className={styles.channelImage}
          />
          <div className={styles.channelName}>{channel.name}</div>
        </a>
      ))
    ) : (
      <div>No channels found</div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Canais que você segue</div>
        <button onClick={() => router.push('/my-following')} className={styles.button}>
          <Image src="/assets/rightarrow.svg" alt="Following" width={24} height={24} />
        </button>
      </div>
      <div className={styles.channelWrapper} ref={followingListRef}>
        {renderFollowingChannels()}
      </div>
      <div className={styles.posts}>Posts dos Canais Seguidos</div>
    </div>
  );
};

export default Following;
