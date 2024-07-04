import React, { memo, useState, useContext, useCallback, } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../components/UI/Notification/Notification';
import { NotificationContext } from '../../../context/NotificationContext';
import './EditFAQ.css';

const EditFAQ = () => {
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <div className="edit-faq-page">
            <Helmet>
                <title>Editar FAQ</title>
                <meta name="description" content="Edite seu perfil na Nilrow." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Editar FAQ" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="edit-faq-container">
                <SubHeader title="Editar FAQ" handleBack={handleBack} />
                <form onSubmit=''>
                    <Card title="Editar FAQ">
                        <CustomInput 
                            title="Pergunta"
                            type="aboutText"
                            name="aboutText"
                            value=''
                            onChange=''                            
                        /> 
                        <CustomInput 
                            title="Resposta"
                            type="aboutText"
                            name="aboutText"
                            value=''
                            onChange=''                            
                        />              
                    </Card>
                    <div style={{ width: '100%' }} className="edit-faq-confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor={"#7B33E5"}
                            type="button"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(EditFAQ );
