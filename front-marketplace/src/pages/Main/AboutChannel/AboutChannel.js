import React, { memo, useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import { getMyChannel } from '../../../services/channelApi';
import { getAboutByChannelId } from '../../../services/ChannelAboutApi';
import './AboutChannel.css';

const AboutChannel = () => {
    const [aboutInfo, setAboutInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const fetchAboutInfo = async () => {
            try {
                const myChannel = await getMyChannel();
                const aboutData = await getAboutByChannelId(myChannel.id);
                setAboutInfo(aboutData || null);
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutInfo();
    }, []);

    if (loading) {
        return <div>Carregando...</div>;
    }

    const rightLink = aboutInfo
        ? { href: "/edit-about", text: "Editar informações" }
        : { href: "/create-about", text: "Criar informações" };

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
                </div>
                <Card 
                    title="Informações"
                    rightLink={rightLink}
                >
                    <div className="about-channel-see-data-wrapper">
                        <SeeData 
                            title="Sobre" 
                            content={aboutInfo?.aboutText || "Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..."} 
                            stackContent={true}                          
                        />
                        <SeeData 
                            title="Políticas" 
                            content={aboutInfo?.storePolicies || "Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..."} 
                            stackContent={true}                          
                        /> 
                        <SeeData 
                            title="Trocas e devoluções" 
                            content={aboutInfo?.exchangesAndReturns || "Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..."} 
                            stackContent={true}                          
                        /> 
                        <SeeData 
                            title="Mais informações" 
                            content={aboutInfo?.additionalInfo || "Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta. Mantenha a permissão ativa para receber recomendações úteis sobre outros..."} 
                            stackContent={true}                          
                        /> 
                    </div>
                </Card>
                <Card 
                    title="FAQ"
                    rightLink={{ href: "/add-faq", text: "+ Adicionar perguntas e respostas" }}
                >
                    <div className="about-channel-see-data-wrapper">
                        <SeeData 
                            title="Pergunta aqui" 
                            content="Resposta aqui" 
                            stackContent={true}
                            linkText="Alterar"
                            link="/edit-faq"                     
                        />                        
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default memo(AboutChannel);
