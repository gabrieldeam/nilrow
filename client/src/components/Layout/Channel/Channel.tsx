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

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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

function Channel({ nickname }: ChannelProps) {
  const router = useRouter();

  // Atualizado: usamos a interface ChannelData em vez de any
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

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
  // Buscar dados iniciais do canal
useEffect(() => {
  const fetchChannelData = async () => {
    try {
      const data = await getChannelByNickname(nickname);

      if (!data || typeof data !== 'object' || !data.id) {
        console.error('Erro: A API retornou um valor inválido para o canal.', data);
        return;
      }

      // Transforma os dados garantindo que imageUrl seja uma string
      const transformedData = { ...data, imageUrl: data.imageUrl || '' };

      setChannelData(transformedData);

      const [countFollowers, countFollowing] = await Promise.all([
        getFollowersCount(data.id),
        getFollowingCount(nickname),
      ]);
      setFollowersCount(countFollowers);
      setFollowingCount(countFollowing);

      const ownerCheck = await isChannelOwner(data.id);
      setIsOwner(ownerCheck);

      const followingCheck = await isFollowing(data.id);
      setIsFollowingChannel(followingCheck);

      const [aboutData, faqsData] = await Promise.all([
        getAboutByNickname(nickname),
        getFAQsByNickname(nickname),
      ]);

      if ((aboutData && aboutData.aboutText) || (faqsData && faqsData.length > 0)) {
        setShowAboutButton(true);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do canal:', error);
    }
  };

  fetchChannelData();
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

  // Botão de Voltar (equivalente a navigate(-1))
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

  // Toggle seções
  const handleButtonClick = (section: 'post' | 'store' | 'assessment' | 'purchaseEvent') => {
    setActiveSection(section);
  };
  const getButtonClass = useCallback(
    (section: string) => {
      return activeSection === section ? `${styles.fixedButton} ${styles.active}` : styles.fixedButton;
    },
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

  // Caso não tenha carregado channelData
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
                  <Image
                    src={globocon}
                    alt="External Link"
                    className={styles.channelLinkButtonIcon}
                  />
                  {formatUrl(channelData.externalLink)}
                </a>
              )}

              {showAboutButton && (
                <button
                  className={styles.channelLinkButton}
                  onClick={handleAboutChannel}
                >
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
              <button className={getButtonClass('store')} onClick={() => handleButtonClick('store')}>
                <Image src={storeIcon} alt="Store" />
              </button>
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
                <Image src={purchaseEventChannelIcon} alt="Purchase Event Channel" />
              </button>
            </div>

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
        {activeSection === 'store' && (
          <div className={styles.channelContentSection}>
            {isMobile && (
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
            <div className={styles.testScrollContainer}>
              <h2>Store Section</h2>
              <Image
                src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg"
                alt="Test Scroll"
                className={styles.testImage}
                width={150}
                height={150}
              />
            </div>
          </div>
        )}

        {activeSection === 'post' && (
          <div className={styles.channelContentSection}>
            <div className={styles.emptyPostContainer}>
              <p>Este canal ainda não tem publicações</p>
            </div>
          </div>
        )}

        {activeSection === 'assessment' && (
          <div className={styles.channelContentSection}>
            <div className={styles.testScrollContainer}>
              <h2>Assessment Section</h2>
              <Image
                src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg"
                alt="Test Scroll"
                className={styles.testImage}
                width={150}
                height={150}
              />
            </div>
          </div>
        )}

        {activeSection === 'purchaseEvent' && (
          <div className={styles.channelContentSection}>
            <div className={styles.testScrollContainer}>
              <h2>Purchase Event Section</h2>
              <Image
                src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg"
                alt="Test Scroll"
                className={styles.testImage}
                width={150}
                height={150}
              />
            </div>
          </div>
        )}
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
