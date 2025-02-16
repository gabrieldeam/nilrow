'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter, useParams } from 'next/navigation';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import { useNotification } from '@/hooks/useNotification';
import { getFAQById, editFAQ, deleteFAQ } from '@/services/channel/faqService';
import { getMyChannelAboutId } from '@/services/channel/aboutService';
import styles from './EditFAQ.module.css';

const EditFAQ = () => {
    const { id } = useParams<{ id: string }>();
    const [faqData, setFaqData] = useState({
        question: '',
        answer: '',
        aboutId: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();
    const { setMessage } = useNotification();

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    useEffect(() => {
        const fetchFAQData = async () => {
            try {
                const faq = await getFAQById(id);
                const about = await getMyChannelAboutId();
                setFaqData({
                    question: faq.question,
                    answer: faq.answer,
                    aboutId: about.id
                });
            } catch (error) {
                console.error('Erro ao buscar FAQ:', error);
                setError('Erro ao buscar FAQ. Por favor, tente novamente.');
            }
        };

        if (id) fetchFAQData();
    }, [id]);

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
            await editFAQ(id, faqData);
            setMessage('FAQ atualizado com sucesso!');
            router.back();
        } catch (error) {
            console.error('Erro ao atualizar FAQ:', error);
            setError('Erro ao atualizar FAQ. Por favor, tente novamente.');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteFAQ(id);
            setMessage('FAQ deletado com sucesso!');
            router.back();
        } catch (error) {
            console.error('Erro ao deletar FAQ:', error);
            setError('Erro ao deletar FAQ. Por favor, tente novamente.');
        }
    };

    return (
        <div className={styles.editFaqPage}>
            <Head>
                <title>Editar FAQ</title>
                <meta name="description" content="Edite seu FAQ na Nilrow." />
            </Head>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <MobileHeader title="Editar FAQ" buttons={{ close: true }} handleBack={handleBack} />
            <div className={styles.editFaqContainer}>
                <SubHeader title="Editar FAQ" handleBack={handleBack} />
                <form onSubmit={handleSave}>
                    <Card title="Editar FAQ" rightButton={{ onClick: handleDelete, text: "Excluir FAQ" }}>
                        <CustomInput title="Pergunta" name="question" value={faqData.question} onChange={handleChange} bottomLeftText={`Caracteres restantes: ${100 - faqData.question.length}`} /> 
                        <CustomInput title="Resposta" name="answer" value={faqData.answer} onChange={handleChange} isTextarea bottomLeftText={`Caracteres restantes: ${500 - faqData.answer.length}`} />              
                    </Card>
                    <div className={styles.editFaqConfirmationButtonSpace}>
                        <StageButton text="Salvar" backgroundColor="#7B33E5" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditFAQ;