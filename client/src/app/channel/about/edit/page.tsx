'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import { useNotification } from '@/hooks/useNotification';
import { getMyChannel } from '@/services/channel/channelService';
import { getAboutByChannelId, editAbout } from '@/services/channel/aboutService';
import styles from './EditAbout.module.css';

import { AboutData } from '@/types/services/channel';

const EditAbout = () => {
    const [error, setError] = useState('');
    const [aboutData, setAboutData] = useState<AboutData>({
        id: '',
        content: '',
        title: '',
        channelId: '',
        aboutText: '',
        storePolicies: '',
        exchangesAndReturns: '',
        additionalInfo: ''
    });
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const { setMessage } = useNotification();

    useEffect(() => {
        setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    }, []);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const myChannel = await getMyChannel();
                const aboutInfo = await getAboutByChannelId(myChannel.id);
                if (aboutInfo) {
                    setAboutData(aboutInfo);
                }
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
                setError('Erro ao buscar dados do canal');
            }
        };

        fetchChannelData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value.length <= 1000) {
            setAboutData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await editAbout(aboutData.id, aboutData);
            setMessage('Informações editadas com sucesso!');
            router.back();
        } catch (error) {
            console.error('Erro ao salvar informações:', error);
            setError('Erro ao salvar informações');
        }
    };

    return (
        <div className={styles.editAboutPage}>
            <Head>
                <title>Editar Informações</title>
                <meta name="description" content="Edite seu perfil na Nilrow." />
            </Head>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {isMobile && (
                <MobileHeader title="Editar Informações" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className={styles.editAboutContainer}>
                <SubHeader title="Editar Informações" handleBack={handleBack} />
                <form onSubmit={handleSave}>
                    <Card title="Sobre o seu canal">
                        <CustomInput title="Texto" name="aboutText" value={aboutData.aboutText} onChange={handleChange} isTextarea bottomLeftText={`Caracteres restantes: ${1000 - aboutData.aboutText.length}`} />
                    </Card>
                    <Card title="Políticas">
                        <CustomInput title="Texto" name="storePolicies" value={aboutData.storePolicies} onChange={handleChange} isTextarea bottomLeftText={`Caracteres restantes: ${1000 - aboutData.storePolicies.length}`} />
                    </Card>
                    <Card title="Trocas e devoluções">
                        <CustomInput title="Texto" name="exchangesAndReturns" value={aboutData.exchangesAndReturns} onChange={handleChange} isTextarea bottomLeftText={`Caracteres restantes: ${1000 - aboutData.exchangesAndReturns.length}`} />
                    </Card>
                    <Card title="Mais informações">
                        <CustomInput title="Texto" name="additionalInfo" value={aboutData.additionalInfo} onChange={handleChange} isTextarea bottomLeftText={`Caracteres restantes: ${1000 - aboutData.additionalInfo.length}`} />
                    </Card>
                    <div className={styles.editAboutConfirmationButtonSpace}>
                        <StageButton text="Salvar" backgroundColor="#7B33E5" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAbout;