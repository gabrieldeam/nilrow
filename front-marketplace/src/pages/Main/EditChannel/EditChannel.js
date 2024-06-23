import React, { useState, useEffect, useContext, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../components/UI/Notification/Notification';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import { NotificationContext } from '../../../context/NotificationContext';
import { Helmet } from 'react-helmet-async';
import { getMyChannel, updateChannel } from '../../../services/channelApi';
import './EditChannel.css';

const EditChannel = () => {
    const [formData, setFormData] = useState({
        name: '',
        biography: '',
        externalLink: '',
        nickname: ''
    });
    const [originalData, setOriginalData] = useState({
        name: '',
        biography: '',
        externalLink: '',
        nickname: ''
    });
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const [channelId, setChannelId] = useState(null);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const channelData = await getMyChannel();
                setFormData({
                    name: channelData.name || '',
                    biography: channelData.biography || '',
                    externalLink: channelData.externalLink || '',
                    nickname: channelData.nickname || ''
                });
                setOriginalData({
                    name: channelData.name || '',
                    biography: channelData.biography || '',
                    externalLink: channelData.externalLink || '',
                    nickname: channelData.nickname || ''
                });
                setChannelId(channelData.id);
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
            }
        };
        fetchChannelData();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if ((name === 'name' && value.length <= 30) || (name === 'biography' && value.length <= 200) || name === 'externalLink') {
            setFormData({ ...formData, [name]: value });
        }
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const updatedChannelData = {
            name: formData.name !== originalData.name ? formData.name : null,
            biography: formData.biography !== originalData.biography ? formData.biography : null,
            externalLink: formData.externalLink !== originalData.externalLink ? formData.externalLink : null
        };

        if (formData.name.length > 30 || formData.biography.length > 200) {
            setError('Nome do canal não pode exceder 30 caracteres e biografia não pode exceder 200 caracteres.');
            setShowNotification(true);
            return;
        }

        try {
            await updateChannel(channelId, updatedChannelData);
            setMessage('Dados do canal atualizados com sucesso!');
            navigate(`/@${formData.nickname}`);
        } catch (error) {
            const errorMessage = error.response?.data || 'Erro ao atualizar dados do canal. Tente novamente.';
            console.error('Erro ao atualizar dados do canal:', errorMessage);
            setError(errorMessage);
            setShowNotification(true);
        }
    }, [formData, originalData, setMessage, navigate, channelId]);

    return (
        <div className="edit-channel-page">
            <Helmet>
                <title>Editar Canal</title>
                <meta name="description" content="Edite seu canal de divulgação" />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Editar canal" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="edit-channel-container">
                <SubHeader title="Editar canal" handleBack={handleBack} />
                <form onSubmit={handleSubmit}>
                    <Card title="Alterar">
                        <CustomInput 
                            title="Nome do canal"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength={30}
                            bottomLeftText={`Caracteres restantes: ${30 - (formData.name ? formData.name.length : 0)}`}
                        />
                        <CustomInput 
                            title="Biografia"
                            type="text"
                            name="biography"
                            value={formData.biography}
                            onChange={handleChange}
                            maxLength={200}
                            bottomLeftText={`Caracteres restantes: ${200 - (formData.biography ? formData.biography.length : 0)}`}
                        />
                        <CustomInput 
                            title="Link Externo"
                            type="text"
                            name="externalLink"
                            value={formData.externalLink}
                            onChange={handleChange}
                        />
                    </Card>
                    <div style={{ width: '100%' }} className="confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor="#7B33E5"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(EditChannel);
