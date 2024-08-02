import React, { memo, useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { getChannelByNickname, isChannelOwner, isFollowing, followChannel, unfollowChannel, getFollowersCount, getFollowingCount } from '../../../services/channelApi';
import { getAboutByNickname, getFAQsByNickname } from '../../../services/channelApi';
import { checkAuth } from '../../../services/api';
import { startConversation } from '../../../services/ChatApi';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import SubButton from '../../../components/UI/Buttons/SubButton/SubButton';
import getConfig from '../../../config';
import './Channel.css';
import chatIcon from '../../../assets/chat.svg';
import followIcon from '../../../assets/follow.svg';
import editChannelIcon from '../../../assets/editChannel.svg';
import shareIcon from '../../../assets/share.svg';
import infoIcon from '../../../assets/info.svg';
import globocon from '../../../assets/globo.svg';
import storeIcon from '../../../assets/store.svg';
import postIcon from '../../../assets/posts.svg';
import assessmentIcon from '../../../assets/assessment.svg';
import categoriesIcon from '../../../assets/categories.svg';
import searchIcon from '../../../assets/search.svg';
import purchaseEventChannelIcon from '../../../assets/purchaseEventChannel.svg';
import ImageModal from '../../../components/UI/ImageModal/ImageModal';

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'Milhão';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'Mil';
    } else {
        return num.toString();
    }
};

const formatUrl = (url) => {
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
};

const Channel = ({ nickname }) => {
    const [channelData, setChannelData] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isFollowingChannel, setIsFollowingChannel] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFixed, setIsFixed] = useState(false);
    const [activeSection, setActiveSection] = useState('post');
    const [showAboutButton, setShowAboutButton] = useState(false);
    const { apiUrl } = getConfig();
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const data = await getChannelByNickname(nickname);
                setChannelData(data);
    
                const [followersCount, followingCount] = await Promise.all([
                    getFollowersCount(data.id),
                    getFollowingCount(nickname)
                ]);
                setFollowersCount(followersCount);
                setFollowingCount(followingCount);
    
                const [ownerCheck, followingCheck, aboutData, faqsData] = await Promise.all([
                    isChannelOwner(data.id),
                    isFollowing(data.id),
                    getAboutByNickname(nickname),
                    getFAQsByNickname(nickname)
                ]);
                setIsOwner(ownerCheck);
                setIsFollowingChannel(followingCheck);
    
                // Verificar se há dados em about ou faqs
                if ((aboutData && (aboutData.aboutText || aboutData.storePolicies || aboutData.exchangesAndReturns || aboutData.additionalInfo)) || (faqsData && faqsData.length > 0)) {
                    setShowAboutButton(true);
                }
    
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
            }
        };
    
        fetchChannelData();
    }, [nickname]);
    

    const handleScroll = useCallback(() => {
        const offsetTop = 80;
        const channelButtonsSection = document.querySelector('.channel-buttons-section');

        if (channelButtonsSection) {
            const rect = channelButtonsSection.getBoundingClientRect();
            if (rect.top <= offsetTop) {
                setIsFixed(true);
            } else if (window.scrollY <= offsetTop) {
                setIsFixed(false);
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleMyChannel = useCallback(() => {
        navigate(`/my-channel`);
    }, [navigate]);

    const handleAboutChannel = useCallback(() => {
        navigate(`/@${nickname}/about`);
    }, [navigate, nickname]);

    const handleImageClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    const getButtonClass = useCallback((section) => {
        return activeSection === section ? 'fixed-button active' : 'fixed-button';
    }, [activeSection]);

    const handleSearchClick = () => {
        navigate('/store-search');
    };

    const handleFollowersClick = () => {
        navigate(`/channel-follow/${nickname}`);
    };

    const handleFollowingClick = () => {
        navigate(`/channel-follow/${nickname}`);
    };

    const handleFollowClick = async () => {
        const authResponse = await checkAuth();
        if (!authResponse.isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            await followChannel(channelData.id);
            setIsFollowingChannel(true);
            const newFollowersCount = await getFollowersCount(channelData.id);
            setFollowersCount(newFollowersCount);
        } catch (error) {
            console.error('Erro ao seguir o canal:', error);
        }
    };

    const handleUnfollowClick = async () => {
        const authResponse = await checkAuth();
        if (!authResponse.isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            await unfollowChannel(channelData.id);
            setIsFollowingChannel(false);
            const newFollowersCount = await getFollowersCount(channelData.id);
            setFollowersCount(newFollowersCount);
        } catch (error) {
            console.error('Erro ao deixar de seguir o canal:', error);
        }
    };

    const handleMessageClick = async () => {
        try {
            const conversation = await startConversation(channelData.id, "");
            navigate(`/chat?conversationId=${conversation.id}`);
        } catch (error) {
            console.error('Erro ao iniciar conversa:', error);
        }
    };

    if (!channelData) {
        return <LoadingSpinner />;
    }

    const stageButtons = isOwner
        ? [
            { text: "Editar Canal", backgroundColor: "#212121", imageSrc: editChannelIcon, onClick: handleMyChannel },
            { text: "Compartilhar", backgroundColor: "#212121", imageSrc: shareIcon }
        ]
        : isFollowingChannel
            ? [
                { text: "Amigos", backgroundColor: "#212121", onClick: handleUnfollowClick },
                { text: "Mensagem", backgroundColor: "#212121", imageSrc: chatIcon, onClick: handleMessageClick }
            ]
            : [
                { text: "Seguir", backgroundColor: "#DF1414", imageSrc: followIcon, onClick: handleFollowClick },
                { text: "Mensagem", backgroundColor: "#212121", imageSrc: chatIcon, onClick: handleMessageClick }
            ];

    return (
        <div className="channel-page">
            <Helmet>
                <title>{channelData.name} - Canal</title>
                <meta name="description" content={channelData.biography} />
            </Helmet>
            {isMobile && (
                <MobileHeader
                    title={`@${nickname}`}
                    buttons={{ close: true, address: true, bag: true, qrcode: isOwner ? true : undefined, share: !isOwner ? true : undefined }}
                    handleBack={handleBack}
                />
            )}
            <div className="channel-container">
                <div className="channel-banner-section">
                    <div className="channel-left">
                        <img
                            src={`${apiUrl}${channelData.imageUrl}`}
                            alt={`${channelData.name} - Imagem`}
                            className="channel-image"
                            onClick={handleImageClick}
                            onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                e.target.src = 'path/to/placeholder/image.png';
                            }}
                        />
                        <div className="channel-details">
                            <h1 className="channel-name">{channelData.name}</h1>
                            <div className="channel-follow-info">
                                <button className="follow-info-button" onClick={handleFollowersClick}>
                                    <span>{formatNumber(followersCount)}</span> Seguidores
                                </button>
                                <button className="follow-info-button" onClick={handleFollowingClick}>
                                    <span>{formatNumber(followingCount)}</span> Seguindo
                                </button>
                            </div>
                            {channelData.biography && (
                                <p className="channel-biography">{channelData.biography}</p>
                            )}
                        </div>
                    </div>
                    <div className="channel-right">
                        <div className={`channel-link-button-container ${!channelData.externalLink ? 'centered' : ''}`}>
                            {channelData.externalLink && (
                                <a href={channelData.externalLink} target="_blank" rel="noopener noreferrer" className="channel-link-button">
                                    <img src={globocon} alt="External Link" className="channel-link-button-icon" />
                                    {formatUrl(channelData.externalLink)}
                                </a>
                            )}
                            {showAboutButton && (
                            <button className="channel-link-button" onClick={handleAboutChannel}>
                                <img src={infoIcon} alt="Sobre" className="channel-link-button-icon" />
                                SOBRE
                            </button>
                        )}
                        </div>
                        <div className="channel-stage-buttons">
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

                <div className={`channel-buttons-section ${isFixed ? 'fixed-channel-buttons-section' : ''}`}>
                    <div className="buttons-container">
                        <div className="fixed-buttons-container">
                            <button className={getButtonClass('store')} onClick={() => handleButtonClick('store')}>
                                <img src={storeIcon} alt="Store" />
                            </button>
                            <button className={getButtonClass('post')} onClick={() => handleButtonClick('post')}>
                                <img src={postIcon} alt="Post" />
                            </button>
                            <button className={getButtonClass('assessment')} onClick={() => handleButtonClick('assessment')}>
                                <img src={assessmentIcon} alt="Assessment" />
                            </button>
                            <button className={getButtonClass('purchaseEvent')} onClick={() => handleButtonClick('purchaseEvent')}>
                                <img src={purchaseEventChannelIcon} alt="Purchase Event Channel" />
                            </button>
                        </div>
                        {!isMobile && activeSection === 'store' && (
                            <div className="sub-buttons-container">
                                <SubButton text="Categorias" backgroundColor="#212121" imageSrc={categoriesIcon} />
                                <SubButton text="Pesquisar" backgroundColor="#212121" imageSrc={searchIcon} onClick={handleSearchClick} />
                            </div>
                        )}
                    </div>
                </div>
                
                {activeSection === 'store' && (
                    <div className="channel-content-section">
                        {isMobile && (
                            <div className="sub-buttons-container">
                                <SubButton text="Categorias" backgroundColor="#212121" imageSrc={categoriesIcon} />
                                <SubButton text="Pesquisar" backgroundColor="#212121" imageSrc={searchIcon} onClick={handleSearchClick} />
                            </div>
                        )}
                        <div className="test-scroll-container">
                            <h2>Store Section</h2>
                            <img src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg" alt="Test Scroll" className="test-image" />
                        </div>
                    </div>
                )}
                
                {activeSection === 'post' && (
                    <div className="channel-content-section">
                        <div className="empty-post-container">
                            <p>Este canal ainda não tem publicações</p>
                        </div>
                    </div>
                )}

                {activeSection === 'assessment' && (
                    <div className="channel-content-section">
                        <div className="test-scroll-container">
                            <h2>Assessment Section</h2>
                            <img src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg" alt="Test Scroll" className="test-image" />
                        </div>
                    </div>
                )}

                {activeSection === 'purchaseEvent' && (
                    <div className="channel-content-section">
                        <div className="test-scroll-container">
                            <h2>Purchase Event Section</h2>
                            <img src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg" alt="Test Scroll" className="test-image" />
                        </div>
                    </div>
                )}

            </div>
            
            {isModalOpen && (
                <ImageModal imageUrl={`${apiUrl}${channelData.imageUrl}`} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default memo(Channel);
