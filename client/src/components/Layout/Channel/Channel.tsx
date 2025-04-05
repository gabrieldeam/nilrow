'use client';

import React, { memo, useEffect, useState, useCallback } from 'react';
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

// Importando as seções
import StoreSection from './sections/StoreSection/StoreSection';
import PostSection from './sections/PostSection/PostSection';
import AssessmentSection from './sections/AssessmentSection/AssessmentSection';
import PurchaseEventSection from './sections/PurchaseEventSection/PurchaseEventSection';

import { getPublishedCatalogs } from '../../../services/catalogService';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Import de ícones
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

// Import do CSS principal do Channel
import styles from './channel.module.css';

// Função para formatar números
function formatNumber(num: number) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'Milhão';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'Mil';
  } else {
    return num.toString();
  }
}

function formatUrl(url: string) {
  try {
    const urlObj = new URL(url.includes('://') ? url : `http://${url}`);
    let formattedUrl = urlObj.hostname;
    if (formattedUrl.startsWith('www.')) {
      formattedUrl = formattedUrl.substring(4);
    }
    return formattedUrl;
  } catch (error) {
    console.error('Erro ao formatar URL:', error);
    return url;
  }
}

// Tipagem das propriedades do componente
interface ChannelProps {
  nickname: string;
}

// Definindo a interface para os dados do canal
interface ChannelData {
  id: string;
  name: string;
  biography?: string;
  externalLink?: string;
  imageUrl: string;
  // Adicione outras propriedades conforme necessário
}

// Definindo a interface para os catálogos publicados
interface Catalog {
  id: string;
  name: string;
}

function Channel({ nickname }: ChannelProps) {
  const router = useRouter();

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  // Agora armazenamos os catálogos com id e name
  const [publishedCatalogs, setPublishedCatalogs] = useState<Catalog[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [activeSection, setActiveSection] = useState<'post' | 'store' | 'assessment' | 'purchaseEvent'>('post');
  const [showAboutButton, setShowAboutButton] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // Buscar dados iniciais do canal
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // 1) Buscar dados do canal
        const channel = await getChannelByNickname(nickname);
        if (!channel || !channel.id) {
          console.error('Canal inválido', channel);
          return; // Sai se não houver canal válido
        }
        setChannelData({ ...channel, imageUrl: channel.imageUrl || '' });

        // 2) Buscar tudo que é "público" em paralelo utilizando Promise.allSettled
        const results = await Promise.allSettled([
          getFollowersCount(channel.id),
          getFollowingCount(nickname),
          getAboutByNickname(nickname),
          getFAQsByNickname(nickname),
          getPublishedCatalogs(channel.id),
        ]);

        const countFollowers = results[0].status === 'fulfilled' ? results[0].value : 0;
        const countFollowing = results[1].status === 'fulfilled' ? results[1].value : 0;
        const aboutData = results[2].status === 'fulfilled' ? results[2].value : null;
        const faqsData = results[3].status === 'fulfilled' ? results[3].value : [];
        const catalogs = results[4].status === 'fulfilled' ? results[4].value : [];

        setFollowersCount(countFollowers);
        setFollowingCount(countFollowing);

        // Se "about" ou "FAQ" tiver conteúdo, habilita o botão "Sobre"
        if ((aboutData?.aboutText) || (faqsData && faqsData.length > 0)) {
          setShowAboutButton(true);
        }

        // Monta a lista de catálogos publicados
        const mappedCatalogs = catalogs.map((c: any) => ({
          id: c.id,
          name: c.name || 'Loja'
        }));
        setPublishedCatalogs(mappedCatalogs);

        // 3) Verifica se o usuário está autenticado para buscar dados restritos
        const authResponse = await checkAuth();
        if (authResponse.isAuthenticated) {
          try {
            const [ownerCheck, followingCheck] = await Promise.all([
              isChannelOwner(channel.id),
              isFollowing(channel.id),
            ]);
            setIsOwner(ownerCheck);
            setIsFollowingChannel(followingCheck);
          } catch (err) {
            console.error('Erro ao buscar info autenticada:', err);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do canal (ou dados públicos):', error);
      }
    };

    fetchPublicData();
  }, [nickname]);

  // Scroll fixo para os botões
  const handleScroll = useCallback(() => {
    const offsetTop = 80;
    const section = document.querySelector('.channel-buttons-section');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    if (rect.top <= offsetTop) {
      setIsFixed(true);
    } else if (window.scrollY <= offsetTop) {
      setIsFixed(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Botão de voltar
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Ir para MyChannel
  const handleMyChannel = useCallback(() => {
    router.push('/channel');
  }, [router]);

  // Exibir about
  const handleAboutChannel = useCallback(() => {
    router.push(`/${nickname}/about`);
  }, [router, nickname]);

  // Modal de imagem
  const handleImageClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Toggle das seções
  const handleButtonClick = (section: 'post' | 'store' | 'assessment' | 'purchaseEvent') => {
    setActiveSection(section);
  };

  const getButtonClass = useCallback(
    (section: string) => activeSection === section ? `${styles.fixedButton} ${styles.active}` : styles.fixedButton,
    [activeSection]
  );

  // Ir para busca de store
  const handleSearchClick = () => {
    router.push('/store-search');
  };

  // Ir para followers e following
  const handleFollowersClick = () => {
    router.push(`/channel/follow/${nickname}`);
  };
  const handleFollowingClick = () => {
    router.push(`/channel/follow/${nickname}`);
  };

  // Seguir / Deixar de seguir
  const handleFollowClick = async () => {
    const authResponse = await checkAuth();
    if (!authResponse.isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await followChannel(channelData!.id);
      setIsFollowingChannel(true);
      const newCount = await getFollowersCount(channelData!.id);
      setFollowersCount(newCount);
    } catch (error) {
      console.error('Erro ao seguir canal:', error);
    }
  };

  const handleUnfollowClick = async () => {
    const authResponse = await checkAuth();
    if (!authResponse.isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await unfollowChannel(channelData!.id);
      setIsFollowingChannel(false);
      const newCount = await getFollowersCount(channelData!.id);
      setFollowersCount(newCount);
    } catch (error) {
      console.error('Erro ao deixar de seguir o canal:', error);
    }
  };

  // Iniciar conversa
  const handleMessageClick = async () => {
    try {
      const conversationId = await startConversation(channelData!.id, '');
      if (!conversationId || typeof conversationId !== 'string') {
        console.error('Erro: A API retornou um ID inválido.', conversationId);
        return;
      }
      router.push(`/chat?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };

  if (!channelData) {
    return <LoadingSpinner />;
  }

  // Botões do canal (StageButton)
  const stageButtons = isOwner
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
    : [
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
      ];

  return (
    <div className={styles.channelPage}>
      <Head>
        <title>{channelData.name} - Canal</title>
        <meta name="description" content={channelData.biography} />
      </Head>

      {/* Header mobile */}
      {isMobile && (
        <MobileHeader
          title={`${nickname}`}
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
        {/* Banner */}
        <div className={styles.channelBanner}>
          <div className={styles.channelLeft}>
            <Image
              src={`${apiUrl}${channelData.imageUrl}`}
              alt={`${channelData.name} - Imagem`}
              className={styles.channelImage}
              width={130}
              height={130}
              onClick={handleImageClick}
              onError={(e) => {
                console.error('Erro ao carregar imagem:', e);
                (e.target as HTMLImageElement).src = 'path/to/placeholder.png';
              }}
            />
            <div className={styles.channelDetails}>
              <h1 className={styles.channelName}>{channelData.name}</h1>
              <div className={styles.followInfo}>
                <button className={styles.followInfoButton} onClick={handleFollowersClick}>
                  <span>{formatNumber(followersCount)}</span> Seguidores
                </button>
                <button className={styles.followInfoButton} onClick={handleFollowingClick}>
                  <span>{formatNumber(followingCount)}</span> Seguindo
                </button>
              </div>
              {channelData.biography && (
                <p className={styles.biography}>{channelData.biography}</p>
              )}
            </div>
          </div>

          {/* Botões à direita */}
          <div className={styles.channelRight}>
            <div className={`${styles.channelLinkButtonContainer} ${!channelData.externalLink ? styles.centered : ''}`}>
              {channelData.externalLink && (
                <a
                  href={channelData.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.channelLinkButton}
                >
                  <Image
                    src={globocon}
                    alt="External Link"
                    className={styles.channelLinkButtonIcon}
                  />
                  {formatUrl(channelData.externalLink)}
                </a>
              )}

              {showAboutButton && (
                <button className={styles.channelLinkButton} onClick={handleAboutChannel}>
                  <Image
                    src={infoIcon}
                    alt="Sobre"
                    className={styles.channelLinkButtonIcon}
                  />
                  SOBRE
                </button>
              )}
            </div>

            <div className={styles.channelStageButtons}>
              {stageButtons.map((button, index) => (
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
        </div>

        {/* Seção de botões fixos */}
        <div className={`${styles.channelButtonsSection} ${isFixed ? styles.fixedChannelButtonsSection : ''} channel-buttons-section`}>
          <div className={styles.buttonsContainer}>
            <div className={styles.fixedButtonsContainer}>
              {/* Renderiza o botão "Store" somente se existir pelo menos um catálogo publicado */}
              {publishedCatalogs.length > 0 && (
                <button className={getButtonClass('store')} onClick={() => handleButtonClick('store')}>
                  <Image src={storeIcon} alt="Store" />
                </button>
              )}
              <button className={getButtonClass('post')} onClick={() => handleButtonClick('post')}>
                <Image src={postIcon} alt="Post" />
              </button>
              <button className={getButtonClass('assessment')} onClick={() => handleButtonClick('assessment')}>
                <Image src={assessmentIcon} alt="Assessment" />
              </button>
              <button className={getButtonClass('purchaseEvent')} onClick={() => handleButtonClick('purchaseEvent')}>
                <Image src={purchaseEventChannelIcon} alt="Purchase Event Channel" />
              </button>
            </div>

            {/* SubButtons para a Store (desktop view) */}
            {!isMobile && activeSection === 'store' && (
              <div className={styles.subButtonsContainer}>
                <SubButton
                  text="Categorias"
                  backgroundColor="#212121"
                  imageSrc={categoriesIcon}
                />
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

        {/* Conteúdos por seção */}
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

      {/* Modal de imagem */}
      {isModalOpen && (
        <ImageModal
          imageUrl={`${apiUrl}${channelData.imageUrl}`}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default memo(Channel);
