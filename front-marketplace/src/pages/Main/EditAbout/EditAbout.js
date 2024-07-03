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
import './EditAbout.css';

const EditAbout = () => {
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
<div className="edit-about-page">
            <Helmet>
                <title>Editar Informações</title>
                <meta name="description" content="Edite seu perfil na Nilrow." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Editar Informações" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="edit-about-container">
                <SubHeader title="Editar Informações" handleBack={handleBack} />
                <form onSubmit=''>
                    <Card title="Sobre o seu canal">
                        <CustomInput 
                            title="Texto"
                            type="aboutText"
                            name="aboutText"
                            value=''
                            onChange=''                            
                        />                
                    </Card>
                    <div style={{ width: '100%' }} className="edit-about-confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor={"#7B33E5"}
                            type="button"
                        />
                    </div>
                </form>
                <form onSubmit=''>
                    <Card title="Politicas">
                        <CustomInput 
                            title="Texto"
                            type="storePolicies"
                            name="storePolicies"
                            value=''
                            onChange=''
                        />                
                    </Card>
                    <div style={{ width: '100%' }} className="edit-about-confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor={"#7B33E5"}
                            type="button"
                        />
                    </div>
                </form>
                <form onSubmit=''>
                    <Card title="Trocas e devoluções">
                        <CustomInput 
                            title="Texto"
                            type="exchangesAndReturns"
                            name="exchangesAndReturns"
                            value=''
                            onChange=''
                        />                
                    </Card>
                    <div style={{ width: '100%' }} className="edit-about-confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor={"#7B33E5"}
                            type="button"
                        />
                    </div>
                </form>
                <form onSubmit=''>
                    <Card title="Mais informações">
                        <CustomInput 
                            title="Texto"
                            type="additionalInfo"
                            name="additionalInfo"
                            value=''
                            onChange=''
                        />                
                    </Card>
                    <div style={{ width: '100%' }} className="edit-about-confirmationButton-space">
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

export default memo(EditAbout);
