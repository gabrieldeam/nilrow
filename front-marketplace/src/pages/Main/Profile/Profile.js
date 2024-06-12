import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import './Profile.css';
import ordersIcon from '../../../assets/orders.svg';
import notificationsIcon from '../../../assets/notifications.svg';
import blockedIcon from '../../../assets/blocked.svg';
import likesIcon from '../../../assets/likes.svg';
import dataEditIcon from '../../../assets/dataedit.svg';
import { logout } from '../../../services/api';

const Profile = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const handleDataClick = () => {
        navigate('/data');
    };

    return (
        <div className="profile-page">
            <Helmet>
                <title>Meu perfil - Nilrow</title>
                <meta name="description" content="Veja seu perfil na Nilrow." />
            </Helmet>
            <div className="profile-container">
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
                    <div className="logout-link">
                        <button className="logout-button" onClick={handleLogout}>Sair</button>
                    </div>
                </div>
                <div className="profile-steps">
                    <StepButton
                        icon={dataEditIcon}
                        title="Dados pessoais"
                        paragraph="Informações do seu documento de identidade e sua atividade econômica."
                        onClick={handleDataClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(Profile);
