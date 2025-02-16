'use client';

import { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import { useNotification } from '@/hooks/useNotification';
import { getMyChannelAboutId } from '@/services/channel/aboutService';
import { createFAQ } from '@/services/channel/faqService';
import styles from './AddFAQ.module.css';

const AddFAQ = () => {
    const [faqData, setFaqData] = useState({
        question: '',
        answer: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();
    const { setMessage } = useNotification();

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if ((name === 'question' && value.length > 100) || (name === 'answer' && value.length > 500)) return;
        
        setFaqData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const about = await getMyChannelAboutId();
            const aboutId = about.id; // Extraindo o ID corretamente
            await createFAQ({ ...faqData, aboutId });
            setMessage('Pergunta e resposta adicionadas com sucesso!');
            router.back();
        } catch (error) {
            console.error('Erro ao adicionar FAQ:', error);
            setError('Erro ao adicionar FAQ. Por favor, tente novamente.');
        }
    };

    return (
        <div className={styles.addFaqPage}>
            <Head>
                <title>Adicionar perguntas e respostas</title>
                <meta name="description" content="Adicione perguntas e respostas ao seu canal na Nilrow." />
            </Head>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <MobileHeader title="Adicionar perguntas e respostas" buttons={{ close: true }} handleBack={handleBack} />
            <div className={styles.addFaqContainer}>
                <SubHeader title="Adicionar perguntas e respostas" handleBack={handleBack} />
                <form onSubmit={handleSave}>
                    <Card title="Adicionar">
                        <CustomInput title="Pergunta" name="question" value={faqData.question} onChange={handleChange} bottomLeftText={`Caracteres restantes: ${100 - faqData.question.length}`} /> 
                        <CustomInput title="Resposta" name="answer" value={faqData.answer} onChange={handleChange} isTextarea bottomLeftText={`Caracteres restantes: ${500 - faqData.answer.length}`} />              
                    </Card>
                    <div className={styles.addFaqConfirmationButtonSpace}>
                        <StageButton text="Salvar" backgroundColor="#7B33E5" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFAQ;