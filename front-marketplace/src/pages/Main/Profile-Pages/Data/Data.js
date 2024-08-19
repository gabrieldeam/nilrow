import React, { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Data.css';
import Card from '../../../../components/UI/Card/Card';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SeeData from '../../../../components/UI/SeeData/SeeData';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import { getUserProfile } from '../../../../services/profileApi';

const Data = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({});
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileData = await getUserProfile();
                setProfile(profileData);
            } catch (error) {
                console.error('Erro ao buscar dados do perfil:', error);
            }
        };

        fetchProfileData();
    }, []);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <div className="data-page">
            <Helmet>
                <title>Dados - Nilrow</title>
                <meta name="description" content="Veja seus dados na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Dados" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="data-container">
                <SubHeader title="Dados" handleBack={handleBack} />
                <Card 
                    title="Dados da sua conta"
                    rightLink={{ href: "/edit-data", text: "Alterar" }}>
                    <div className="see-data-wrapper">
                        <SeeData title="Nome completo" content={profile.name} />
                        <SeeData title="CPF" content={profile.cpf} />
                        <SeeData title="Data de nacimento" content={profile.birthDate} />
                        <SeeData title="Senha" content="*********" />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default memo(Data);
