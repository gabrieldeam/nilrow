import React, { memo, useState, useContext, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../../components/UI/CustomInput/CustomInput';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import Card from '../../../../components/UI/Card/Card';
import StageButton from '../../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../../components/UI/Notification/Notification';
import { NotificationContext } from '../../../../context/NotificationContext';
import { createFAQ, getMyChannelAboutId } from '../../../../services/ChannelAboutApi';
import './AddFAQ.css';

const AddFAQ = () => {
    const [faqData, setFaqData] = useState({
        question: '',
        answer: ''
    });
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'question' && value.length > 100) return;
        if (name === 'answer' && value.length > 500) return;

        setFaqData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const aboutId = await getMyChannelAboutId(); // Obtendo o aboutId
            await createFAQ({ ...faqData, aboutId });
            setMessage('Pergunta e resposta adicionadas com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao adicionar FAQ:', error);
            setError('Erro ao adicionar FAQ. Por favor, tente novamente.');
            setShowNotification(true);
        }
    };

    return (
        <div className="add-faq-page">
            <Helmet>
                <title>Adicionar perguntas e respostas</title>
                <meta name="description" content="Adicione perguntas e respostas ao seu canal na Nilrow." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Adicionar perguntas e respostas" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="add-faq-container">
                <SubHeader title="Adicionar perguntas e respostas" handleBack={handleBack} />
                <form onSubmit={handleSave}>
                    <Card title="Adicionar">
                        <CustomInput 
                            title="Pergunta"
                            name="question"
                            value={faqData.question}
                            onChange={handleChange}
                            maxLength={100}
                            bottomLeftText={`Caracteres restantes: ${100 - (faqData.question ? faqData.question.length : 0)}`}
                        /> 
                        <CustomInput 
                            title="Resposta"
                            name="answer"
                            value={faqData.answer}
                            onChange={handleChange}
                            isTextarea={true} 
                            maxLength={500}
                            bottomLeftText={`Caracteres restantes: ${500 - (faqData.answer ? faqData.answer.length : 0)}`}
                        />              
                    </Card>
                    <div style={{ width: '100%' }} className="add-faq-confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor={"#7B33E5"}
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(AddFAQ);
