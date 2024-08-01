import React, { memo, useState, useEffect, useContext, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../components/UI/Notification/Notification';
import { NotificationContext } from '../../../context/NotificationContext';
import { getFAQById, editFAQ, deleteFAQ } from '../../../services/ChannelAboutApi';
import './EditFAQ.css';

const EditFAQ = () => {
    const { id } = useParams();
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

    useEffect(() => {
        const fetchFAQData = async () => {
            try {
                const faq = await getFAQById(id);
                setFaqData({
                    question: faq.question,
                    answer: faq.answer
                });
            } catch (error) {
                console.error('Erro ao buscar FAQ:', error);
                setError('Erro ao buscar FAQ. Por favor, tente novamente.');
                setShowNotification(true);
            }
        };

        fetchFAQData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFaqData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await editFAQ(id, faqData);
            setMessage('FAQ atualizado com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao atualizar FAQ:', error);
            setError('Erro ao atualizar FAQ. Por favor, tente novamente.');
            setShowNotification(true);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteFAQ(id);
            setMessage('FAQ deletado com sucesso!');
            navigate(-1); // Voltar para a página anterior
        } catch (error) {
            console.error('Erro ao deletar FAQ:', error);
            setError('Erro ao deletar FAQ. Por favor, tente novamente.');
            setShowNotification(true);
        }
    };

    return (
        <div className="edit-faq-page">
            <Helmet>
                <title>Editar FAQ</title>
                <meta name="description" content="Edite seu FAQ na Nilrow." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Editar FAQ" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="edit-faq-container">
                <SubHeader title="Editar FAQ" handleBack={handleBack} />
                <form onSubmit={handleSave}>
                    <Card 
                        title="Editar FAQ"
                        rightButton={{ onClick: handleDelete, text: "Excluir FAQ" }}
                    >
                        <CustomInput 
                            title="Pergunta"
                            name="question"
                            value={faqData.question}
                            onChange={handleChange}
                        /> 
                        <CustomInput 
                            title="Resposta"
                            name="answer"
                            value={faqData.answer}
                            onChange={handleChange}
                        />              
                    </Card>
                    <div style={{ width: '100%' }} className="edit-faq-confirmationButton-space">
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

export default memo(EditFAQ);
