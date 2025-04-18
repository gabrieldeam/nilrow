'use client';

import React, { memo, useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import StageButton from '@/components/UI/StageButton/StageButton';
import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';
import FAQExpandableCard from '@/components/UI/FAQExpandableCard/FAQExpandableCard';

import {
  getChannelByNickname,
  getAboutByNickname,
  getFAQsByNickname,
  isChannelOwner,
} from '@/services/channel/channelService';
import {
  followChannel,
  unfollowChannel,
  isFollowing,
} from '@/services/channel/followService';
import { checkAuth } from '@/services/authService';
import { startConversation } from '@/services/chatService';

import shareIcon from '../../../../public/assets/share.svg';
import chatIcon from '../../../../public/assets/chat.svg';
import followIcon from '../../../../public/assets/follow.svg';

import styles from './about.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';

// --- tipagens locais ---
interface ChannelData {
  id: string;
  name: string;
  imageUrl: string;
}

interface AboutData {
  aboutText?: string;
  storePolicies?: string;
  exchangesAndReturns?: string;
  additionalInfo?: string;
}

interface FAQData {
  question: string;
  answer: string;
}

// --- componente ---
function AboutPage() {
  const router = useRouter();
  const { nickname } = useParams() as { nickname: string };

  // detecta mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // autenticação
  const [auth, setAuth] = useState<{ isAuthenticated: boolean } | null>(null);
  useEffect(() => {
    checkAuth()
      .then((res) => setAuth(res))
      .catch(() => setAuth({ isAuthenticated: false }));
  }, []);

  // dados do canal, about e FAQ
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [aboutData, setAboutData] = useState<AboutData>({});
  const [faqData, setFaqData] = useState<FAQData[]>([]);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nick = nickname.startsWith('@') ? nickname.slice(1) : nickname;
        const channel = await getChannelByNickname(nick);
        if (!channel) {
          console.error('Canal não encontrado!');
          return;
        }
        setChannelData({ ...channel, imageUrl: channel.imageUrl || '' });

        const about = await getAboutByNickname(nick);
        const faqs = await getFAQsByNickname(nick);

        setAboutData(about || {});
        setFaqData(faqs || []);

        setIsFollowingChannel(await isFollowing(channel.id));
        setIsOwner(await isChannelOwner(channel.id));
      } catch (err) {
        console.error('Erro ao buscar dados do canal:', err);
      }
    };

    fetchData();
  }, [nickname]);

  // handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFollowClick = useCallback(async () => {
    if (!channelData) return;
    try {
      await followChannel(channelData.id);
      setIsFollowingChannel(true);
    } catch (err: any) {
      // redireciona em caso de 401/403
      if (err.response?.status === 401 || err.response?.status === 403) {
        await router.push('/login');
      } else {
        console.error('Erro ao seguir o canal:', err);
      }
    }
  }, [channelData, router]);

  const handleUnfollowClick = useCallback(async () => {
    if (!channelData) return;
    try {
      await unfollowChannel(channelData.id);
      setIsFollowingChannel(false);
    } catch (err) {
      console.error('Erro ao deixar de seguir o canal:', err);
    }
  }, [channelData]);

  const handleMessageClick = useCallback(async () => {
    if (!channelData) return;
    if (!auth?.isAuthenticated) {
      await router.push('/login');
      return;
    }
    try {
      const conversationId = await startConversation(channelData.id, '');
      if (typeof conversationId === 'string') {
        router.push(`/chat?conversationId=${conversationId}`);
      } else {
        console.error('Conversa inválida:', conversationId);
      }
    } catch (err) {
      console.error('Erro ao iniciar conversa:', err);
    }
  }, [channelData, auth, router]);

  if (!channelData) {
    return <div>Carregando...</div>;
  }

  const formattedNickname = nickname.startsWith('@')
    ? nickname.slice(1)
    : nickname;

  // monta os botões de ação
  const stageButtons = isOwner
    ? [
        {
          text: 'Compartilhar',
          backgroundColor: '#212121',
          imageSrc: shareIcon,
          onClick: async () => {}, // placeholder
        },
      ]
    : isFollowingChannel
    ? [
        {
          text: 'Amigos',
          backgroundColor: '#212121',
          onClick: handleUnfollowClick,
        },
        {
          text: 'Mensagem',
          backgroundColor: '#212121',
          imageSrc: chatIcon,
          onClick: handleMessageClick,
        },
        {
          text: 'Compartilhar',
          backgroundColor: '#212121',
          imageSrc: shareIcon,
          onClick: async () => {},
        },
      ]
    : auth === null
    ? [
        {
          text: '…',
          backgroundColor: '#ccc',
          onClick: async () => {},
        },
      ]
    : auth.isAuthenticated
    ? [
        {
          text: 'Seguir',
          backgroundColor: '#DF1414',
          imageSrc: followIcon,
          onClick: handleFollowClick,
        },
        {
          text: 'Mensagem',
          backgroundColor: '#212121',
          imageSrc: chatIcon,
          onClick: handleMessageClick,
        },
        {
          text: 'Compartilhar',
          backgroundColor: '#212121',
          imageSrc: shareIcon,
          onClick: async () => {},
        },
      ]
    : [
        {
          text: 'Seguir',
          backgroundColor: '#DF1414',
          imageSrc: followIcon,
          onClick: async () => {
            await router.push('/login');
          },
        },
        {
          text: 'Mensagem',
          backgroundColor: '#212121',
          imageSrc: chatIcon,
          onClick: async () => {
            await router.push('/login');
          },
        },
        {
          text: 'Compartilhar',
          backgroundColor: '#212121',
          imageSrc: shareIcon,
          onClick: async () => {},
        },
      ];

  return (
    <div className={styles.aboutChannelPage}>
      <Head>
        <title>Sobre o canal</title>
        <meta name="description" content="Veja na Nilrow." />
      </Head>

      {isMobile && (
        <MobileHeader
          title="Sobre"
          buttons={{ close: true, address: true, bag: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles.aboutChannelContainer}>
        <div className={styles.aboutChannelHeader}>
          <div className={styles.aboutChannelLeft}>
            <Image
              src={`${apiUrl}${channelData.imageUrl}`}
              alt={`${channelData.name} – Imagem`}
              className={styles.aboutChannelImage}
              width={130}
              height={130}
            />
            <div
              className={styles.aboutChannelInfo}
              onClick={() => {
                window.location.href = `${frontUrl}${formattedNickname}`;
              }}
            >
              <h2 className={styles.aboutChannelName}>
                {channelData.name}
              </h2>
              <p className={styles.aboutChannelNickname}>
                {nickname}
              </p>
            </div>

            <div className={styles.aboutChannelFollow}>
              {stageButtons
                .filter((btn) => btn.text === 'Seguir' || btn.text === 'Amigos')
                .map((button, idx) => (
                  <StageButton
                    key={idx}
                    text={button.text}
                    backgroundColor={button.backgroundColor}
                    imageSrc={button.imageSrc}
                    onClick={button.onClick}
                  />
                ))}
            </div>
          </div>

          <div className={styles.aboutChannelRight}>
            {stageButtons
              .filter((btn) => btn.text !== 'Seguir' && btn.text !== 'Amigos')
              .map((button, idx) => (
                <StageButton
                  key={idx}
                  text={button.text}
                  backgroundColor={button.backgroundColor}
                  imageSrc={button.imageSrc}
                  onClick={button.onClick}
                />
              ))}
          </div>
        </div>

        <div className={styles.aboutChannelOutro}>
          {aboutData.aboutText && (
            <ExpandableCard title="Sobre" defaultExpanded>
              <p className={styles.aboutChannelText}>
                {aboutData.aboutText}
              </p>
            </ExpandableCard>
          )}

          {faqData.length > 0 && (
            <ExpandableCard title="FAQ">
              {faqData.map((faq, idx) => (
                <FAQExpandableCard
                  key={idx}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </ExpandableCard>
          )}

          {aboutData.storePolicies && (
            <ExpandableCard title="Políticas">
              <p className={styles.aboutChannelText}>
                {aboutData.storePolicies}
              </p>
            </ExpandableCard>
          )}

          {aboutData.exchangesAndReturns && (
            <ExpandableCard title="Trocas e devoluções">
              <p className={styles.aboutChannelText}>
                {aboutData.exchangesAndReturns}
              </p>
            </ExpandableCard>
          )}

          {aboutData.additionalInfo && (
            <ExpandableCard title="Mais informações">
              <p className={styles.aboutChannelText}>
                {aboutData.additionalInfo}
              </p>
            </ExpandableCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AboutPage);
