import React, { memo, useCallback, useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import Card from '../../../components/UI/Card/Card';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SeeData from '../../../components/UI/SeeData/SeeData';
import { getMyChannel, updateChannelImage, toggleChannelVisibility, isChannelActive } from '../../../services/channelApi';
import ConfirmationModal from '../../../components/UI/ConfirmationModal/ConfirmationModal';
import defaultImage from '../../../assets/user.png';
import './MyChannel.css';
import ordersIcon from '../../../assets/orders.svg';
import notificationsIcon from '../../../assets/notifications.svg';
import editAboutIcon from '../../../assets/editAbout.svg';
import promoterIcon from '../../../assets/promoter.svg';
import catalogIcon from '../../../assets/catalog.svg';
import purchaseEventIcon from '../../../assets/purchaseEvent.svg';
import { NotificationContext } from '../../../context/NotificationContext';
import getConfig from '../../../config';

const MyChannel = () => {
    const { setMessage } = useContext(NotificationContext);
    const { apiUrl } = getConfig();
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const [channelData, setChannelData] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(defaultImage);
    const [buttonText, setButtonText] = useState('Escolher arquivo');
    const [instructionText, setInstructionText] = useState('Altere sua foto ou tire uma nova para todos verem de quem é o canal.');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const data = await getMyChannel();
                setChannelData(data);
                if (data.imageUrl) {
                    setImagePreview(`${apiUrl}${data.imageUrl}`);
                }

                const activeStatus = await isChannelActive(data.id);
                setIsActive(activeStatus);
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
            }
        };

        fetchChannelData();
    }, [apiUrl]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setButtonText('Mudar arquivo');
        setInstructionText(file.name);
    };

    const handleImageUpload = async () => {
        if (imageFile && channelData) {
            try {
                await updateChannelImage(channelData.id, imageFile);
                setMessage('Imagem atualizada com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao atualizar imagem:', error);
                setMessage('Erro ao atualizar imagem.', 'error');
            }
        }
    };

    const handleToggleVisibilityClick = () => {
        setIsModalOpen(true);
    };

    const handleToggleVisibilityConfirm = async () => {
        if (channelData) {
            try {
                await toggleChannelVisibility(channelData.id);
                setMessage(`Canal ${isActive ? 'desativado' : 'ativado'} com sucesso!`, 'success');
                if (isActive) {
                    navigate('/profile'); // Redireciona para a página de perfil após desativar
                } else {
                    navigate(`/@${channelData.nickname}`); // Redireciona para o canal após ativar
                }
            } catch (error) {
                console.error(`Erro ao ${isActive ? 'desativar' : 'ativar'} o canal:`, error);
                setMessage(`Erro ao ${isActive ? 'desativar' : 'ativar'} o canal.`, 'error');
            } finally {
                setIsModalOpen(false);
            }
        }
    };

    const handleToggleVisibilityCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="my-channel-page">
            <Helmet>
                <title>Meu Canal</title>
                <meta name="description" content="Veja seu perfil na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Meu Canal" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="my-channel-container">
                <div className="my-channel-content">
                    <div className="my-channel-header">
                        <div className="my-channel-info">
                            <h1 className="my-channel-title roboto-medium">Meu canal</h1>
                            <div className="my-channel-buttons">
                                <HeaderButton icon={ordersIcon} link="/orders" />
                                <HeaderButton icon={notificationsIcon} link="/notifications" />
                            </div>
                        </div>
                        <div className="toggle-visibility-link toggle-visibility-desktop-only">
                            <button className="toggle-visibility-button" onClick={handleToggleVisibilityClick}>
                                {isActive ? 'Desativar canal' : 'Ativar canal'}
                            </button>
                        </div>
                    </div>
                    <div className="my-channel-steps">
                        <div className="my-channel-step-card-wrapper">
                            <div className="my-channel-image-upload">
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="my-channel-image-preview" />
                                )}
                                <div className="my-channel-upload-section">
                                    <p className="my-channel-upload-instruction">
                                        {instructionText}
                                    </p>
                                    <div className="my-channel-buttons-wrapper">
                                        <label htmlFor="channel-image" className="my-channel-upload-button">
                                            {buttonText}
                                        </label>
                                        <input
                                            type="file"
                                            id="channel-image"
                                            name="image"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                        <button onClick={handleImageUpload} className="my-channel-upload-button">
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Card 
                                title="Dados do canal"
                                rightLink={{ href: `/edit-channel/${channelData?.id}`, text: "Alterar" }}>
                                <div className="see-data-wrapper">
                                    <SeeData title="Nome" content={channelData?.name || "Nome do canal"} />
                                    <SeeData title="Bio" content={channelData?.biography || "Biografia do canal"} />
                                    <SeeData title="Link" content={channelData?.externalLink || "Link do canal"} />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="my-channel-additional-steps">
                    <StepButton
                        icon={editAboutIcon}
                        title="Sobre"
                        paragraph="Informações adicionais sobre o canal."
                        onClick={() => navigate('/about-channel')}
                    />
                    <StepButton
                        icon={promoterIcon}
                        title="Divulgador"
                        paragraph="Crie uma conta para divulgar produtos e ganhar comissão."
                        onClick={() => navigate('/depois-colocar')}
                    />
                    <StepButton
                        icon={catalogIcon}
                        title="Catálogo"
                        paragraph="Crie um catálogo e começe a divulgar seus produtos ou serviços."
                        onClick={() => navigate('/depois-colocar')}
                    />
                    <StepButton
                        icon={purchaseEventIcon}
                        title="Evento de compra"
                        paragraph="Crie eventos de compras especiais para divulgar com seus amigos."
                        onClick={() => navigate('/depois-colocar')}
                    />
                </div>
                <div className="toggle-visibility-link toggle-visibility-mobile-only">
                    <button className="toggle-visibility-button" onClick={handleToggleVisibilityClick}>
                        {isActive ? 'Desativar canal' : 'Ativar canal'}
                    </button>
                </div>
            </div>
            <ConfirmationModal 
                isOpen={isModalOpen}
                onConfirm={handleToggleVisibilityConfirm}
                onCancel={handleToggleVisibilityCancel}
                message={`Você tem certeza que deseja ${isActive ? 'desativar' : 'ativar'} o canal?`}
            />
        </div>
    );
};

export default memo(MyChannel);
