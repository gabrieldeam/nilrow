'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Channel from '@/components/Layout/Channel/Channel';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner'; 
import { getChannels } from '@/services/channel/channelService'; 

export default function NicknameRoutePage() {
  const router = useRouter();
  const { nickname } = useParams() as { nickname: string };

  const [loading, setLoading] = useState(true);
  const [isValidNickname, setIsValidNickname] = useState<boolean | null>(null);

  useEffect(() => {
    const checkNickname = async () => {
      try {
        const channels = await getChannels();
        const validNickname = channels.some((channel: any) => channel.nickname === nickname);
        setIsValidNickname(validNickname);
      } catch (error) {
        console.error('Erro ao buscar canais:', error);
        setIsValidNickname(false);
      } finally {
        setLoading(false);
      }
    };

    checkNickname();
  }, [nickname]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isValidNickname) {
    router.push('/');
    return null;
  }

  return <Channel nickname={nickname} />;
}
