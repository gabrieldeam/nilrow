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
import { createAbout } from '@/services/channel/aboutService';
import styles from './CreateAbout.module.css';

import { AboutDTO } from '@/types/services/channel';

const CreateAbout = () => {
    const [error, setError] = useState('');
    const [aboutData, setAboutData] = useState<Omit<AboutDTO, 'id'>>({
        title: '',
        content: '',
        aboutText: '',
        storePolicies: '',
        exchangesAndReturns: '',
        additionalInfo: '',
        channelId: ''
    });
    const router = useRouter();
    const { setMessage } = useNotification();

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const myChannel = await getMyChannel();
                setAboutData(prevData => ({ ...prevData, channelId: myChannel.id }));
            } catch (error) {
                console.error('Erro ao buscar dados do canal:', error);
                setError('Erro ao buscar dados do canal');
            }
        };
        fetchChannelData();
    }, []);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

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
            await createAbout(aboutData);
            setMessage('Informações criadas com sucesso!');
            router.back();
        } catch (error) {
            console.error('Erro ao criar informações:', error);
            setError('Erro ao criar informações');
        }
    };

    return (
        <div className={styles.createAboutPage}>
            <Head>
                <title>Criar Informações</title>
                <meta name="description" content="Criar seu perfil na Nilrow." />
            </Head>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <MobileHeader title="Criar Informações" buttons={{ close: true }} handleBack={handleBack} />
            <div className={styles.createAboutContainer}>
                <SubHeader title="Criar Informações" handleBack={handleBack} />
                <form onSubmit={handleSave}>
                    <Card title="Título">
                        <CustomInput title="Título" name="title" value={aboutData.title} onChange={handleChange} isTextarea bottomLeftText={''} />
                    </Card>
                    <Card title="Conteúdo">
                        <CustomInput title="Conteúdo" name="content" value={aboutData.content} onChange={handleChange} isTextarea bottomLeftText={''} />
                    </Card>
                    <Card title="Sobre o seu canal">
                        <CustomInput title="Texto" name="aboutText" value={aboutData.aboutText} onChange={handleChange} isTextarea bottomLeftText={''} />
                    </Card>
                    <Card title="Políticas">
                        <CustomInput title="Texto" name="storePolicies" value={aboutData.storePolicies} onChange={handleChange} isTextarea bottomLeftText={''} />
                    </Card>
                    <Card title="Trocas e devoluções">
                        <CustomInput title="Texto" name="exchangesAndReturns" value={aboutData.exchangesAndReturns} onChange={handleChange} isTextarea bottomLeftText={''} />
                    </Card>
                    <Card title="Mais informações">
                        <CustomInput title="Texto" name="additionalInfo" value={aboutData.additionalInfo} onChange={handleChange} isTextarea bottomLeftText={''} />
                    </Card>
                    <div className={styles.createAboutConfirmationButtonSpace}>
                        <StageButton text="Salvar" backgroundColor="#7B33E5" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAbout;
