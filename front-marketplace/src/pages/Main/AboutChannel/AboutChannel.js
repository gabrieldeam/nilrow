import React, { memo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import './AboutChannel.css';

const AboutChannel = () => {
    const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <div className="about-channel-page">
            <Helmet>
                <title>Sobre</title>
                <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Sobre" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="about-channel-container">
                <div className="about-channel-header">
                    <SubHeader title="Sobre" handleBack={handleBack} />
                    <div className="delete-link desktop-only">
                        <button className="delete-button" >Deletar conta</button>
                    </div>
                </div>
                <Card   title="Informações"
                        rightLink={{ href: "/edit-about", text: "Editar informações" }}>
                    <div className="about-channel-see-data-wrapper">
                        <SeeData 
                            title="Sobre" 
                            content="Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..." 
                            stackContent={true}                          
                        />
                        <SeeData 
                            title="Politicas" 
                            content="Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..." 
                            stackContent={true}                          
                        /> 
                        <SeeData 
                            title="Trocas e devoluções" 
                            content="Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..." 
                            stackContent={true}                          
                        /> 
                        <SeeData 
                            title="Mais informações" 
                            content="Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..." 
                            stackContent={true}                          
                        /> 
                        
                    </div>
                </Card>
                <Card   title="FAQ"
                        rightLink={{ href: "/edit-about", text: "+ Adicionar perguntas e respostas" }}>
                    <div className="about-channel-see-data-wrapper">
                        <SeeData 
                            title="Pergunta aqui" 
                            content="Resposta aqui" 
                            stackContent={true}
                            linkText="Alterar"
                            link="#"                     
                        />                        
                    </div>
                </Card>
                <div className="delete-link mobile-only">
                    <button className="delete-button">Deletar conta</button>
                </div>
            </div>
        </div>
    );
};

export default memo(AboutChannel);
