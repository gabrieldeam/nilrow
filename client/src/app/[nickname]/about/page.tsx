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

// Interfaces para os dados do canal, about e FAQ
interface ChannelData {
  id: string;
  name: string;
  imageUrl: string;
  // Adicione outras propriedades conforme necessário
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

function AboutPage() {
  const router = useRouter();
  const params = useParams();
  const nickname = params.nickname as string;

  // Detectar se é mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // Estados dos dados
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [aboutData, setAboutData] = useState<AboutData>({});
  const [faqData, setFaqData] = useState<FAQData[]>([]);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Buscar dados do canal, about e FAQ
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Remove arroba, se existir
        const formattedNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;

        const channel = await getChannelByNickname(formattedNickname);
        if (!channel) {
          console.error('Canal não encontrado!');
          return;
        }
        // Transforma os dados garantindo que imageUrl seja sempre uma string
        setChannelData({ ...channel, imageUrl: channel.imageUrl || '' });

        const about = await getAboutByNickname(formattedNickname);
        const faqs = await getFAQsByNickname(formattedNickname);

        setAboutData(about || {});
        setFaqData(faqs || []);

        const following = await isFollowing(channel.id);
        setIsFollowingChannel(following);

        const ownerCheck = await isChannelOwner(channel.id);
        setIsOwner(ownerCheck);
      } catch (error) {
        console.error('Erro ao buscar dados do canal:', error);
      }
    };

    fetchData();
  }, [nickname]);

  // Botão Voltar
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Funções de seguir/deixar de seguir
  const handleFollowClick = useCallback(async () => {
    if (!channelData) return;
    try {
      await followChannel(channelData.id);
      setIsFollowingChannel(true);
    } catch (error) {
      console.error('Erro ao seguir o canal:', error);
    }
  }, [channelData]);

  const handleUnfollowClick = useCallback(async () => {
    if (!channelData) return;
    try {
      await unfollowChannel(channelData.id);
      setIsFollowingChannel(false);
    } catch (error) {
      console.error('Erro ao deixar de seguir o canal:', error);
    }
  }, [channelData]);

  // Mensagem
  const handleMessageClick = useCallback(async () => {
    if (!channelData) return;
    const authResponse = await checkAuth();
    if (!authResponse.isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const conversationId = await startConversation(channelData.id, '');
      if (!conversationId || typeof conversationId !== 'string') {
        console.error('Conversa inválida:', conversationId);
        return;
      }
      router.push(`/chat?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  }, [channelData, router]);

  if (!channelData) {
    return <div>Carregando...</div>;
  }

  // Remover arroba para links
  const formattedNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;

  // Monta StageButtons
  const stageButtons = isOwner
    ? [
        { text: 'Compartilhar', backgroundColor: '#212121', imageSrc: shareIcon },
      ]
    : isFollowingChannel
    ? [
        { text: 'Amigos', backgroundColor: '#212121', onClick: handleUnfollowClick },
        { text: 'Mensagem', backgroundColor: '#212121', imageSrc: chatIcon, onClick: handleMessageClick },
        { text: 'Compartilhar', backgroundColor: '#212121', imageSrc: shareIcon },
      ]
    : [
        { text: 'Seguir', backgroundColor: '#DF1414', imageSrc: followIcon, onClick: handleFollowClick },
        { text: 'Mensagem', backgroundColor: '#212121', imageSrc: chatIcon, onClick: handleMessageClick },
        { text: 'Compartilhar', backgroundColor: '#212121', imageSrc: shareIcon },
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
              alt={`${channelData.name} - Imagem`}
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
              <h2 className={styles.aboutChannelName}>{channelData.name}</h2>
              <p className={styles.aboutChannelNickname}>{nickname}</p>
            </div>

            <div className={styles.aboutChannelFollow}>
              {stageButtons
                .filter((btn) => btn.text === 'Seguir' || btn.text === 'Amigos')
                .map((button, index) => (
                  <StageButton
                    key={index}
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
              .map((button, index) => (
                <StageButton
                  key={index}
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
            <ExpandableCard title="Sobre" defaultExpanded={true}>
              <p className={`${styles.aboutChannelText} roboto-regular`}>
                {aboutData.aboutText}
              </p>
            </ExpandableCard>
          )}

          {faqData.length > 0 && (
            <ExpandableCard title="FAQ">
              {faqData.map((faq, idx) => (
                <FAQExpandableCard key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </ExpandableCard>
          )}

          {aboutData.storePolicies && (
            <ExpandableCard title="Políticas">
              <p className={`${styles.aboutChannelText} roboto-regular`}>
                {aboutData.storePolicies}
              </p>
            </ExpandableCard>
          )}

          {aboutData.exchangesAndReturns && (
            <ExpandableCard title="Trocas e devoluções">
              <p className={`${styles.aboutChannelText} roboto-regular`}>
                {aboutData.exchangesAndReturns}
              </p>
            </ExpandableCard>
          )}

          {aboutData.additionalInfo && (
            <ExpandableCard title="Mais informações">
              <p className={`${styles.aboutChannelText} roboto-regular`}>
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
