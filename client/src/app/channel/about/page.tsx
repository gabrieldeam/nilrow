'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import SeeData from '@/components/UI/SeeData/SeeData';
import { getMyChannel } from '@/services/channel/channelService';
import { getAboutByChannelId } from '@/services/channel/aboutService';
import { getFAQsByAboutId } from '@/services/channel/faqService';
import styles from './AboutChannel.module.css';

import { AboutData, FAQData } from '@/types/services/channel';

const AboutChannel = () => {
    const [aboutInfo, setAboutInfo] = useState<AboutData | null>(null);
    const [faqs, setFaqs] = useState<FAQData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMobile(window.innerWidth <= 768);
    }, []);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    useEffect(() => {
        const fetchAboutInfo = async () => {
            try {
                const myChannel = await getMyChannel();
                const aboutData = await getAboutByChannelId(myChannel.id);
                setAboutInfo(aboutData || null);

                if (aboutData?.id) {
                    const faqsData = await getFAQsByAboutId(aboutData.id);
                    setFaqs(faqsData);
                }
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
        ? { href: "/channel/about/edit", text: "Editar informações" }
        : { href: "/channel/about/create", text: "Criar informações" };

    return (
        <div className={styles.aboutMyChannelPage}>
            <Head>
                <title>Sobre</title>
                <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
            </Head>
            {isMobile && (
                <MobileHeader title="Sobre" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className={styles.aboutMyChannelContainer}>
                <div className={styles.aboutMyChannelHeader}>
                    <SubHeader title="Sobre" handleBack={handleBack} />
                </div>
                <Card title="Informações" rightLink={rightLink}>
                    <div className={styles.aboutMyChannelSeeDataWrapper}>
                        <SeeData title="Sobre" content={aboutInfo?.aboutText || "Sem informações disponíveis."} stackContent />
                        <SeeData title="Políticas" content={aboutInfo?.storePolicies || "Sem informações disponíveis."} stackContent />
                        <SeeData title="Trocas e devoluções" content={aboutInfo?.exchangesAndReturns || "Sem informações disponíveis."} stackContent />
                        <SeeData title="Mais informações" content={aboutInfo?.additionalInfo || "Sem informações disponíveis."} stackContent />
                    </div>
                </Card>
                <Card title="FAQ" rightLink={{ href: "/channel/about/addfaq", text: "+ Adicionar perguntas e respostas" }}>
                    <div className={styles.aboutMyChannelSeeDataWrapper}>
                        {faqs.length > 0 ? (
                            faqs.map(faq => (
                                <SeeData 
                                    key={faq.id}
                                    title={faq.question} 
                                    content={faq.answer} 
                                    stackContent
                                    linkText="Alterar"
                                    link={`/channel/about/editfaq/${faq.id}`}                      
                                />
                            ))
                        ) : (
                            <div>Nenhuma FAQ disponível.</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AboutChannel;
