import React, { memo, useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import ExpandableCard from '../../../components/UI/ExpandableCard/ExpandableCard';
import './About.css';
import getConfig from '../../../config';
import { getChannelByNickname, getAboutByNickname, getFAQsByNickname, followChannel, unfollowChannel, isFollowing, isChannelOwner } from '../../../services/channelApi';
import { checkAuth } from '../../../services/api';
import { startConversation } from '../../../services/ChatApi';
import shareIcon from '../../../assets/share.svg';
import chatIcon from '../../../assets/chat.svg';
import followIcon from '../../../assets/follow.svg';

const About = () => {
    const { apiUrl, frontUrl } = getConfig();
    const { nickname } = useParams();
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const [channelData, setChannelData] = useState(null);
    const [aboutData, setAboutData] = useState({});
    const [faqData, setFaqData] = useState([]);
    const [isFollowingChannel, setIsFollowingChannel] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const formattedNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;
                console.log('formattedNickname:', formattedNickname); // Log para verificar o nickname formatado
                const channel = await getChannelByNickname(formattedNickname);
                const about = await getAboutByNickname(formattedNickname);
                const faqs = await getFAQsByNickname(formattedNickname);

                setChannelData(channel);
                setAboutData(about);
                setFaqData(faqs);
                setIsFollowingChannel(await isFollowing(channel.id));
                setIsOwner(await isChannelOwner(channel.id));
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);                
            }
        };

        fetchData();
    }, [nickname, navigate]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleFollowClick = async () => {
        try {
            await followChannel(channelData.id);
            setIsFollowingChannel(true);
        } catch (error) {
            console.error('Erro ao seguir o canal:', error);
        }
    };

    const handleUnfollowClick = async () => {
        try {
            await unfollowChannel(channelData.id);
            setIsFollowingChannel(false);
        } catch (error) {
            console.error('Erro ao deixar de seguir o canal:', error);
        }
    };

    const handleMessageClick = async () => {
        const authResponse = await checkAuth();
        if (!authResponse.isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const conversation = await startConversation(channelData.id, "");
            navigate(`/chat?conversationId=${conversation.id}`);
        } catch (error) {
            console.error('Erro ao iniciar conversa:', error);
        }
    };

    if (!channelData) {
        return <div>Carregando...</div>;
    }

    // Remover "@" do nickname para navegação
    const formattedNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;

    const stageButtons = isOwner
        ? [
            { text: "Compartilhar", backgroundColor: "#212121", imageSrc: shareIcon }
        ]
        : isFollowingChannel
            ? [
                { text: "Amigos", backgroundColor: "#212121", onClick: handleUnfollowClick },
                { text: "Mensagem", backgroundColor: "#212121", imageSrc: chatIcon, onClick: handleMessageClick },
                { text: "Compartilhar", backgroundColor: "#212121", imageSrc: shareIcon }
            ]
            : [
                { text: "Seguir", backgroundColor: "#DF1414", imageSrc: followIcon, onClick: handleFollowClick },
                { text: "Mensagem", backgroundColor: "#212121", imageSrc: chatIcon, onClick: handleMessageClick },
                { text: "Compartilhar", backgroundColor: "#212121", imageSrc: shareIcon }
            ];

    return (
        <div className="about-channel-page">
            <Helmet>
                <title>Sobre o canal</title>
                <meta name="description" content="Veja na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader
                    title="Sobre"
                    buttons={{ close: true, address: true, bag: true }}
                    handleBack={handleBack}
                />
            )}
            <div className="about-channel-container">
                <div className="about-channel-header">
                    <div className="about-channel-left">
                        <img
                            src={`${apiUrl}${channelData.imageUrl}`}
                            alt={`${channelData.name} - Imagem`}
                            className="about-channel-image"
                            onError={(e) => {
                                e.target.src = 'path/to/placeholder/image.png';
                            }}
                        />
                        <div className="about-channel-info" onClick={() => {                            
                            window.location.href = `${frontUrl}${formattedNickname}`;
                        }}>
                            <h2 className="about-channel-name">{channelData.name}</h2>
                            <p className="about-channel-nickname">{nickname}</p>
                        </div>
                        <div className="about-channel-follow">
                            {stageButtons.filter(button => button.text === "Seguir" || button.text === "Amigos").map((button, index) => (
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
                    <div className="about-channel-right">
                        {stageButtons.filter(button => button.text !== "Seguir" && button.text !== "Amigos").map((button, index) => (
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
                <div className="about-channel-outro">
                    <ExpandableCard title="Sobre">
                        <p>{aboutData.aboutText}</p>
                    </ExpandableCard>
                    <ExpandableCard title="FAQ">
                        {faqData.map((faq, index) => (
                            <div key={index}>
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </div>
                        ))}
                    </ExpandableCard>
                    <ExpandableCard title="Políticas">
                        <p>{aboutData.storePolicies}</p>
                    </ExpandableCard>
                    <ExpandableCard title="Trocas e devoluções">
                        <p>{aboutData.exchangesAndReturns}</p>
                    </ExpandableCard>
                    <ExpandableCard title="Mais informações">
                        <p>{aboutData.additionalInfo}</p>
                    </ExpandableCard>
                </div>
            </div>            
        </div>
    );
};

export default memo(About);
