import React, { memo, useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { getChannelByNickname, isChannelOwner } from '../../../services/channelApi';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import getConfig from '../../../config';
import './Channel.css';
import chatIcon from '../../../assets/chat.svg';
import followIcon from '../../../assets/follow.svg';
import editChannelIcon from '../../../assets/editChannel.svg';
import shareIcon from '../../../assets/share.svg';
import infoIcon from '../../../assets/info.svg';
import globocon from '../../../assets/globo.svg';

const Channel = ({ nickname }) => {
    const [channelData, setChannelData] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const { apiUrl } = getConfig();
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const data = await getChannelByNickname(nickname);
                setChannelData(data);

                const ownerCheck = await isChannelOwner(data.id);
                setIsOwner(ownerCheck);
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
            }
        };

        fetchChannelData();
    }, [nickname, apiUrl]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleMyChannel = useCallback(() => {
        navigate(`/my-channel`);
    }, [navigate]);

    const handleAboutChannel = useCallback(() => {
        navigate(`/about-channel`);
    }, [navigate]);

    if (!channelData) {
        return <LoadingSpinner />;
    }

    return (
        <div className="channel-page">
            <Helmet>
                <title>{channelData.name} - Canal</title>
                <meta name="description" content={channelData.biography} />
            </Helmet>
            {isMobile && (
                <MobileHeader title={`@${nickname}`} buttons={{ close: true, address: true, bag: true, qrcode: true }} handleBack={handleBack} />
            )}
            <div className="channel-container">
                <div className="channel-left">
                    <img
                        src={`${apiUrl}${channelData.imageUrl}`}
                        alt={`${channelData.name} - Imagem`}
                        className="channel-image"
                        onError={(e) => {
                            console.error('Erro ao carregar imagem:', e);
                            e.target.src = 'path/to/placeholder/image.png';
                        }}
                    />
                    <div className="channel-details">
                        <h1 className="channel-name">{channelData.name}</h1>
                        {channelData.biography && (
                            <p className="channel-biography">{channelData.biography}</p>
                        )}
                    </div>
                </div>
                <div className="channel-right">
                    <div className="channel-link-button-container">
                        {channelData.externalLink && (
                            <a href={channelData.externalLink} target="_blank" rel="noopener noreferrer" className="channel-link-button">
                                <img src={globocon} alt="External Link" className="channel-link-button-icon" />
                                {channelData.externalLink}
                            </a>
                        )}
                        <button className="channel-link-button" onClick={handleAboutChannel}>
                            <img src={infoIcon} alt="Sobre" className="channel-link-button-icon" />
                            Sobre
                        </button>
                    </div>
                    <div className="channel-stage-buttons">
                        {isOwner ? (
                            <>
                                <StageButton text="Editar Canal" backgroundColor="#212121" imageSrc={editChannelIcon} onClick={handleMyChannel} />
                                <StageButton text="Compartilhar" backgroundColor="#212121" imageSrc={shareIcon} />
                            </>
                        ) : (
                            <>
                                <StageButton text="Seguir" backgroundColor="#DF1414" imageSrc={followIcon} />
                                <StageButton text="Mensagem" backgroundColor="#212121" imageSrc={chatIcon} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Channel);
