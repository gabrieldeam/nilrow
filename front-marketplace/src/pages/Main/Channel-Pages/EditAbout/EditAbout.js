import React, { memo, useState, useEffect, useContext, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../../components/UI/CustomInput/CustomInput';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import Card from '../../../../components/UI/Card/Card';
import StageButton from '../../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../../components/UI/Notification/Notification';
import { NotificationContext } from '../../../../context/NotificationContext';
import { getMyChannel } from '../../../../services/channelApi';
import { getAboutByChannelId, editAbout } from '../../../../services/ChannelAboutApi';
import './EditAbout.css';

const EditAbout = () => {
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const [aboutData, setAboutData] = useState({
        aboutText: '',
        storePolicies: '',
        exchangesAndReturns: '',
        additionalInfo: ''
    });
    const [aboutId, setAboutId] = useState('');
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const myChannel = await getMyChannel();
                const aboutInfo = await getAboutByChannelId(myChannel.id);
                if (aboutInfo) {
                    setAboutId(aboutInfo.id); // Definindo o aboutId
                    setAboutData({
                        aboutText: aboutInfo.aboutText || '',
                        storePolicies: aboutInfo.storePolicies || '',
                        exchangesAndReturns: aboutInfo.exchangesAndReturns || '',
                        additionalInfo: aboutInfo.additionalInfo || ''
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
                setError('Erro ao buscar dados do canal');
                setShowNotification(true);
            }
        };

        fetchChannelData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value.length <= 1000) {
            setAboutData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (aboutId) {
                await editAbout(aboutId, { ...aboutData });
                setMessage('Informações editadas com sucesso!');
            } else {
                setError('Não foi possível identificar o registro de informações para edição.');
                setShowNotification(true);
            }
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar informações:', error);
            setError('Erro ao salvar informações');
            setShowNotification(true);
        }
    };

    return (
        <div className="edit-about-page">
            <Helmet>
                <title>Editar Informações</title>
                <meta name="description" content="Edite seu perfil na Nilrow." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Editar Informações" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="edit-about-container">
                <SubHeader title="Editar Informações" handleBack={handleBack} />
                <form onSubmit={handleSave}>
                    <Card title="Sobre o seu canal">
                        <CustomInput 
                            title="Texto"
                            name="aboutText"
                            value={aboutData.aboutText}
                            onChange={handleChange} 
                            isTextarea={true} 
                            maxLength={1000}
                            bottomLeftText={`Caracteres restantes: ${1000 - (aboutData.aboutText.length || 0)}`}
                        />                
                    </Card>
                    <Card title="Políticas">
                        <CustomInput 
                            title="Texto"
                            name="storePolicies"
                            value={aboutData.storePolicies}
                            onChange={handleChange} 
                            isTextarea={true} 
                            maxLength={1000}
                            bottomLeftText={`Caracteres restantes: ${1000 - (aboutData.storePolicies.length || 0)}`}
                        />                
                    </Card>
                    <Card title="Trocas e devoluções">
                        <CustomInput 
                            title="Texto"
                            name="exchangesAndReturns"
                            value={aboutData.exchangesAndReturns}
                            onChange={handleChange} 
                            isTextarea={true} 
                            maxLength={1000}
                            bottomLeftText={`Caracteres restantes: ${1000 - (aboutData.exchangesAndReturns.length || 0)}`}
                        />                
                    </Card>
                    <Card title="Mais informações">
                        <CustomInput 
                            title="Texto"
                            name="additionalInfo"
                            value={aboutData.additionalInfo}
                            onChange={handleChange} 
                            isTextarea={true} 
                            maxLength={1000}
                            bottomLeftText={`Caracteres restantes: ${1000 - (aboutData.additionalInfo.length || 0)}`}
                        />                
                    </Card>
                    <div style={{ width: '100%' }} className="edit-about-confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor={"#7B33E5"}
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(EditAbout);
