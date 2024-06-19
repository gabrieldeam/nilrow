import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getChannels } from '../../../services/channelApi'; 
import Channel from '../../../pages/Main/Channel/Channel'; 
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';

const NicknameRoute = () => {
    const location = useLocation();
    const [isValidNickname, setIsValidNickname] = useState(null);

    useEffect(() => {
        const checkNickname = async () => {
            if (location.pathname.startsWith('/@')) {
                const nickname = location.pathname.substring(2); 
                try {
                    const channels = await getChannels();
                    const validNickname = channels.some(channel => channel.nickname === nickname);
                    setIsValidNickname(validNickname);
                } catch (error) {
                    console.error('Erro ao buscar canais:', error);
                    setIsValidNickname(false);
                }
            } else {
                setIsValidNickname(false);
            }
        };

        checkNickname();
    }, [location.pathname]);

    if (isValidNickname === null) {
        return <LoadingSpinner />; 
    }

    if (isValidNickname) {
        const nickname = location.pathname.substring(2);
        return <Channel nickname={nickname} />;
    }

    return <Navigate to="/" />;
};

export default NicknameRoute;
