import React, { memo, useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { getChannelByNickname } from '../../../services/channelApi';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import getConfig from '../../../config';
import './Channel.css';

const Channel = ({ nickname }) => {
    const [channelData, setChannelData] = useState(null);
    const { apiUrl } = getConfig();
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const data = await getChannelByNickname(nickname);
                setChannelData(data);
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
            }
        };

        fetchChannelData();
    }, [nickname]);

    const handleBack = useCallback(() => {
        navigate(-1);
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
                <MobileHeader title={nickname} buttons={{ close: true, address: true, bag: true, qrcode: true }} handleBack={handleBack} />
            )}
            <div className="channel-container">
                <div className="channel-left">
                    <img
                        src={`${apiUrl}${channelData.imageUrl}`}
                        alt={`${channelData.name} - Imagem`}
                        className="channel-image"
                    />
                    <div className="channel-details">
                        <h1 className="channel-name">{channelData.name}</h1>
                        {channelData.biography && (
                            <p className="channel-biography">{channelData.biography}</p>
                        )}
                    </div>
                </div>
                <div className="channel-right">
                    {channelData.externalLink && (
                        <p className="channel-external-link">
                            <a href={channelData.externalLink} target="_blank" rel="noopener noreferrer">
                                {channelData.externalLink}
                            </a>
                        </p>
                    )}
                    <div className="stage-buttons">
                        <StageButton text="Button 1" />
                        <StageButton text="Button 2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Channel);
