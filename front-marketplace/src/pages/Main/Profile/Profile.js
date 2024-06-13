import React, { useState, useEffect, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import Card from '../../../components/UI/Card/Card';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SeeData from '../../../components/UI/SeeData/SeeData';
import './Profile.css';
import ordersIcon from '../../../assets/orders.svg';
import notificationsIcon from '../../../assets/notifications.svg';
import blockedIcon from '../../../assets/blocked.svg';
import likesIcon from '../../../assets/likes.svg';
import dataEditIcon from '../../../assets/dataedit.svg';
import addressIcon from '../../../assets/addressProfile.svg';
import cardIcon from '../../../assets/card.svg';
import privacyIcon from '../../../assets/privacy.svg';
import profileIcon from '../../../assets/profile.svg';
import { logout } from '../../../services/api';
import { getUserProfile, getUserNickname } from '../../../services/profileApi';

const Profile = () => {
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const [profile, setProfile] = useState({});
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileData = await getUserProfile();
                setProfile(profileData);
                const userNickname = await getUserNickname();
                setNickname(userNickname);
            } catch (error) {
                console.error('Erro ao buscar dados do perfil:', error);
            }
        };

        fetchProfileData();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            window.location.reload();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const formattedNickname = `@${nickname}`;
    const formattedPhone = profile.phone?.startsWith('55') ? profile.phone.substring(2) : profile.phone;

    return (
        <div className="profile-page">
            <Helmet>
                <title>Meu perfil - Nilrow</title>
                <meta name="description" content="Veja seu perfil na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Meu perfil" buttons={{ bag: true }} />
            )}
            <div className="profile-container">
                <div className="profile-content">
                    <div className="profile-header">
                        <div className="profile-info">
                            <h1 className="profile-title roboto-medium">Meu perfil</h1>
                            <div className="profile-buttons">
                                <HeaderButton icon={ordersIcon} link="/orders" />
                                <HeaderButton icon={notificationsIcon} link="/notifications" />
                                <HeaderButton icon={blockedIcon} link="/blocked" />
                                <HeaderButton icon={likesIcon} link="/likes" />
                            </div>
                        </div>
                        <div className="logout-link desktop-only">
                            <button className="logout-button" onClick={handleLogout}>Sair</button>
                        </div>
                    </div>
                    <div className="profile-steps">
                        <div className="step-card-wrapper">
                            <StepButton
                                className="data-personal"
                                icon={dataEditIcon}
                                title="Dados pessoais"
                                paragraph="Informações do seu documento de identidade e sua atividade econômica."
                                onClick={() => navigate('/data')}
                            />
                            <Card 
                                title="Dados da sua conta"
                                rightLink={{ href: "/edit-profile", text: "Alterar" }}>
                                <div className="see-data-wrapper">
                                    <SeeData title="E-mail" content={profile.email} />
                                    <SeeData title="Telefone" content={formattedPhone} />
                                    <SeeData title="Nome de usuário" content={formattedNickname} />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="additional-steps">
                    <StepButton
                        icon={addressIcon}
                        title="Endereços"
                        paragraph="Endereços de entrega salvos na sua conta"
                        onClick={() => navigate('/address')}
                    />
                    <StepButton
                        icon={cardIcon}
                        title="Cartões"
                        paragraph="Todos cartões usados para comprar salvos na sua conta."
                        onClick={() => navigate('/cards')}
                    />
                    <StepButton
                        icon={privacyIcon}
                        title="Privacidade"
                        paragraph="Preferências e controle do uso dos seus dados."
                        onClick={() => navigate('/privacy')}
                    />
                    <StepButton
                        icon={profileIcon}
                        title="Canal"
                        paragraph="Perfil público da sua conta, onde todos os usuários poderão te achar."
                        onClick={() => navigate('/data')}
                    />
                </div>
                <div className="logout-link mobile-only">
                    <button className="logout-button" onClick={handleLogout}>Sair</button>
                </div>
            </div>
        </div>
    );
};

export default memo(Profile);
