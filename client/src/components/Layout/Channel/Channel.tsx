'use client';

import React, { memo, useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import MobileHeader from '../MobileHeader/MobileHeader';
import LoadingSpinner from '../../UI/LoadingSpinner/LoadingSpinner';
import StageButton from '../../UI/StageButton/StageButton';
import SubButton from '../../UI/SubButton/SubButton';
import ImageModal from '../../Modals/ImageModal/ImageModal';

import {
  getChannelByNickname,
  isChannelOwner,
  getAboutByNickname,
  getFAQsByNickname,
} from '../../../services/channel/channelService';
import {
  isFollowing,
  followChannel,
  unfollowChannel,
  getFollowersCount,
  getFollowingCount,
} from '../../../services/channel/followService';
import { checkAuth } from '../../../services/authService';
import { startConversation } from '../../../services/chatService';

// sections
import StoreSection from './sections/StoreSection/StoreSection';
import PostSection from './sections/PostSection/PostSection';
import AssessmentSection from './sections/AssessmentSection/AssessmentSection';
import PurchaseEventSection from './sections/PurchaseEventSection/PurchaseEventSection';

import { getPublishedCatalogs } from '../../../services/catalogService';

// icons
import chatIcon from '../../../../public/assets/chat.svg';
import followIcon from '../../../../public/assets/follow.svg';
import editChannelIcon from '../../../../public/assets/editChannel.svg';
import shareIcon from '../../../../public/assets/share.svg';
import infoIcon from '../../../../public/assets/info.svg';
import globocon from '../../../../public/assets/globo.svg';
import storeIcon from '../../../../public/assets/store.svg';
import postIcon from '../../../../public/assets/posts.svg';
import assessmentIcon from '../../../../public/assets/assessment.svg';
import categoriesIcon from '../../../../public/assets/categories.svg';
import searchIcon from '../../../../public/assets/search.svg';
import purchaseEventChannelIcon from '../../../../public/assets/purchaseEventChannel.svg';
import defaultImage from '../../../../public/assets/user.png';


import styles from './channel.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ------------- helpers -------------
const formatNumber = (num: number) =>
  num >= 1_000_000
    ? (num / 1_000_000).toFixed(1) + 'Milhão'
    : num >= 1000
    ? (num / 1000).toFixed(1) + 'Mil'
    : num.toString();

const formatUrl = (url: string) => {
  try {
    const u = new URL(url.includes('://') ? url : `http://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

// ------------- tipos -------------
interface ChannelProps {
  nickname: string;
}
interface ChannelData {
  id: string;
  name: string;
  biography?: string;
  externalLink?: string;
  imageUrl: string;
}
interface Catalog {
  id: string;
  name: string;
}

// ------------- componente -------------
function Channel({ nickname }: ChannelProps) {
  const router = useRouter();

  // autenticação: carregamos UMA vez
  const [auth, setAuth] = useState<{ isAuthenticated: boolean } | null>(null);
  useEffect(() => {
    checkAuth()
      .then(setAuth)
      .catch(() => setAuth({ isAuthenticated: false }));
  }, []);

  // dados
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [publishedCatalogs, setPublishedCatalogs] = useState<Catalog[]>([]);

  // UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    'post' | 'store' | 'assessment' | 'purchaseEvent'
  >('post');
  const [showAboutButton, setShowAboutButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // fetch público + privado
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Canal
        const channel = await getChannelByNickname(nickname);
        if (!channel?.id) return;
        setChannelData({ ...channel, imageUrl: channel.imageUrl || '' });
  
        // 2) Dados públicos, um por um
        try {
          const count = await getFollowersCount(channel.id);
          setFollowersCount(count);
        } catch (err) { console.warn('Seg:', err) }
  
        try {
          const count = await getFollowingCount(nickname);
          setFollowingCount(count);
        } catch (err) { console.warn('Seguindo:', err) }
  
        try {
          const about = await getAboutByNickname(nickname);
          if (about?.aboutText) setShowAboutButton(true);
        } catch (err) { console.warn('About:', err) }
  
        try {
          const faqs = await getFAQsByNickname(nickname);
          if (faqs?.length > 0) setShowAboutButton(true);
        } catch (err) { console.warn('FAQs:', err) }
  
        try {
          const catalogs = await getPublishedCatalogs(channel.id);
          setPublishedCatalogs(
            catalogs.map(c => ({ id: c.id, name: c.title || 'Loja' }))
          );
        } catch (err) { console.warn('Catálogos:', err) }
  
        // 3) Auth / dados privados
        const authResult = await checkAuth();
        setAuth(authResult);
  
        if (authResult.isAuthenticated) {
          try {
            const ownerFlag = await isChannelOwner(channel.id);
            setIsOwner(ownerFlag);
          } catch (err) { console.warn('Owner:', err) }
  
          try {
            const followFlag = await isFollowing(channel.id);
            setIsFollowingChannel(followFlag);
          } catch (err) { console.warn('FollowFlag:', err) }
        }
      } catch (err) {
        console.error('Erro geral ao buscar canal:', err);
      }
    };
  
    fetchData();
  }, [nickname]);
  
  

  // navegação
  const handleBack = () => router.back();
  const handleMyChannel = () => router.push('/channel');
  const handleAboutChannel = () => router.push(`/${nickname}/about`);
  const handleSearchClick = () => router.push('/store-search');
  const handleFollowersClick = () => router.push(`/channel/follow/${nickname}`);
  const handleFollowingClick = () => router.push(`/channel/follow/${nickname}`);

  // follow / unfollow
  const handleFollowClick = async () => {
    if (!channelData) return;
    try {
      await followChannel(channelData.id);
      setIsFollowingChannel(true);
      setFollowersCount(await getFollowersCount(channelData.id));
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        await router.push('/login');
      } else {
        console.error('Erro ao seguir canal:', err);
      }
    }
  };

  const handleUnfollowClick = async () => {
    if (!channelData) return;
    try {
      await unfollowChannel(channelData.id);
      setIsFollowingChannel(false);
      setFollowersCount(await getFollowersCount(channelData.id));
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        await router.push('/login');
      } else {
        console.error('Erro ao deixar de seguir:', err);
      }
    }
  };

  // mensagem
  const handleMessageClick = async () => {
    if (!channelData) return;
    if (!auth?.isAuthenticated) {
      await router.push('/login');
      return;
    }
    try {
      const id = await startConversation(channelData.id, '');
      if (typeof id === 'string') router.push(`/chat?conversationId=${id}`);
    } catch (err) {
      console.error('Erro ao iniciar conversa:', err);
    }
  };

  // modal img
  const handleImageClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // seção ativa
  const handleButtonClick = (section: typeof activeSection) => setActiveSection(section);
  const getButtonClass = (section: string) =>
    activeSection === section ? `${styles.fixedButton} ${styles.active}` : styles.fixedButton;

  if (!channelData) return <LoadingSpinner />;

  const avatarSrc = channelData.imageUrl
  ? `${apiUrl}${channelData.imageUrl}`
  : defaultImage;


  // ---------- StageButtons ----------
  const stageButtons =
    isOwner
      ? [
          {
            text: 'Editar Canal',
            backgroundColor: '#212121',
            imageSrc: editChannelIcon,
            onClick: handleMyChannel,
          },
          {
            text: 'Compartilhar',
            backgroundColor: '#212121',
            imageSrc: shareIcon,
            onClick: async () => {},
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
        ];

  // ---------- JSX ----------
  return (
    <div className={styles.channelPage}>
      <Head>
        <title>{channelData.name} – Canal</title>
        <meta name="description" content={channelData.biography} />
      </Head>

      {isMobile && (
        <MobileHeader
          title={nickname}
          buttons={{
            close: true,
            address: true,
            bag: true,
            qrcode: isOwner ? true : undefined,
            share: !isOwner ? true : undefined,
          }}
          handleBack={handleBack}
        />
      )}

      <div className={styles.channelContainer}>
        {/* banner */}
        <div className={styles.channelBanner}>
          <div className={styles.channelLeft}>
            <Image
              src={avatarSrc}
              alt={`${channelData.name} – Imagem`}
              className={styles.channelImage}
              width={130}
              height={130}
              onClick={handleImageClick}
            />
            <div className={styles.channelDetails}>
              <h1 className={styles.channelName}>{channelData.name}</h1>
              <div className={styles.followInfo}>
                <button onClick={handleFollowersClick} className={styles.followInfoButton}>
                  <span>{formatNumber(followersCount)}</span> Seguidores
                </button>
                <button onClick={handleFollowingClick} className={styles.followInfoButton}>
                  <span>{formatNumber(followingCount)}</span> Seguindo
                </button>
              </div>
              {channelData.biography && <p className={styles.biography}>{channelData.biography}</p>}
            </div>
          </div>

          {/* direita */}
          <div className={styles.channelRight}>
            <div
              className={`${styles.channelLinkButtonContainer} ${
                !channelData.externalLink ? styles.centered : ''
              }`}
            >
              {channelData.externalLink && (
                <a
                  href={channelData.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.channelLinkButton}
                >
                  <Image src={globocon} alt="External" className={styles.channelLinkButtonIcon} />
                  {formatUrl(channelData.externalLink)}
                </a>
              )}

              {showAboutButton && (
                <button className={styles.channelLinkButton} onClick={handleAboutChannel}>
                  <Image src={infoIcon} alt="Sobre" className={styles.channelLinkButtonIcon} />
                  SOBRE
                </button>
              )}
            </div>

            <div className={styles.channelStageButtons}>
              {stageButtons.map((b, i) => (
                <StageButton
                  key={i}
                  text={b.text}
                  backgroundColor={b.backgroundColor}
                  imageSrc={b.imageSrc}
                  onClick={b.onClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* botões (agora STICKY) */}
        <div className={`${styles.channelButtonsSection} channel-buttons-section`}>
          <div className={styles.buttonsContainer}>
            <div className={styles.fixedButtonsContainer}>
              {publishedCatalogs.length > 0 && (
                <button className={getButtonClass('store')} onClick={() => handleButtonClick('store')}>
                  <Image src={storeIcon} alt="Store" />
                </button>
              )}
              <button className={getButtonClass('post')} onClick={() => handleButtonClick('post')}>
                <Image src={postIcon} alt="Post" />
              </button>
              <button
                className={getButtonClass('assessment')}
                onClick={() => handleButtonClick('assessment')}
              >
                <Image src={assessmentIcon} alt="Assessment" />
              </button>
              <button
                className={getButtonClass('purchaseEvent')}
                onClick={() => handleButtonClick('purchaseEvent')}
              >
                <Image src={purchaseEventChannelIcon} alt="Purchase" />
              </button>
            </div>

            {/* subbuttons store (desktop) */}
            {!isMobile && activeSection === 'store' && (
              <div className={styles.subButtonsContainer}>
                <SubButton text="Categorias" backgroundColor="#212121" imageSrc={categoriesIcon} />
                <SubButton
                  text="Pesquisar"
                  backgroundColor="#212121"
                  imageSrc={searchIcon}
                  onClick={handleSearchClick}
                />
              </div>
            )}
          </div>
        </div>

        {/* seções */}
        {activeSection === 'store' && publishedCatalogs.length > 0 && (
          <StoreSection
            isMobile={isMobile}
            handleSearchClick={handleSearchClick}
            catalogs={publishedCatalogs}
            nickname={nickname}
          />
        )}
        {activeSection === 'post' && <PostSection />}
        {activeSection === 'assessment' && <AssessmentSection />}
        {activeSection === 'purchaseEvent' && <PurchaseEventSection />}
      </div>

      {/* modal img */}
      {isModalOpen && (
        <ImageModal imageUrl={`${apiUrl}${channelData.imageUrl}`} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default memo(Channel);
