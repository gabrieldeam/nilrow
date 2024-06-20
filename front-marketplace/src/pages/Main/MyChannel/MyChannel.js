import React, { memo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import Card from '../../../components/UI/Card/Card';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SeeData from '../../../components/UI/SeeData/SeeData';
import './MyChannel.css';
import ordersIcon from '../../../assets/orders.svg';
import notificationsIcon from '../../../assets/notifications.svg';
import dataEditIcon from '../../../assets/dataedit.svg';
import promoterIcon from '../../../assets/promoter.svg';
import catalogIcon from '../../../assets/catalog.svg';
import purchaseEventIcon from '../../../assets/purchaseEvent.svg';
import editAboutIcon from '../../../assets/editAbout.svg';

const MyChannel = () => {
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <div className="my-channel-page">
            <Helmet>
                <title>Meu Canal</title>
                <meta name="description" content="Veja seu perfil na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Meu Canal" buttons={{ close: true }} handleBack={handleBack}/>
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
                        <div className="delete-link delete-desktop-only">
                            <button className="delete-button" onClick="#">Deletar canal</button>
                        </div>
                    </div>
                    <div className="my-channel-steps">
                        <div className="my-channel-step-card-wrapper">
                            <StepButton 
                                className="data-personal"                               
                                icon={dataEditIcon}
                                title="Editar foto"
                                paragraph="Altere sua foto ou tirar uma nova para todos verem de quem é o canal."
                                onClick={() => navigate('/edit-photo')}
                            />
                            <Card 
                                title="Dados do canal"
                                rightLink={{ href: "/edit-channel:id", text: "Alterar" }}>
                                <div className="see-data-wrapper">
                                    <SeeData title="Nome" content="Nome do canal" />
                                    <SeeData title="Bio" content="Biografia do canal" />
                                    <SeeData title="Link" content="Link do canal" />
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
                        onClick={() => navigate('/depois-colocar')}
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
                <div className="delete-link delete-mobile-only">
                    <button className="delete-button" onClick="#">Deletar canal</button>
                </div>
            </div>
        </div>
    );
};

export default memo(MyChannel);
