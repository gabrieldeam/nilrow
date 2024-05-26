import React, { useState, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '../../../components/Others/PrivacyNotice/PrivacyNotice';
import Notification from '../../../components/UI/Notification/Notification';
import { NotificationContext } from '../../../context/NotificationContext';
import './Signup.css';
import Header from '../../../components/Auth/Header/Header';
import Footer from '../../../components/Auth/Footer/Footer';
import { register } from '../../../services/api';
import iconStep1 from '../../../assets/contato.svg';
import iconStep2 from '../../../assets/user.svg';
import iconStep3 from '../../../assets/tranca.svg';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        name: '',
        cpf: '',
        birthDate: '',
        nickname: '',
        password: '',
        confirmPassword: ''
    });

    const [completedSteps, setCompletedSteps] = useState({
        step1: false,
        step2: false,
        step3: false
    });

    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleStepCompletion = (step) => {
        setCompletedSteps(prev => ({ ...prev, [step]: true }));
        console.log('Step completed:', step, completedSteps);
        navigate('/signup');
    };

    const completeSignup = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setShowNotification(true);
            return;
        }

        if (!completedSteps.step1 || !completedSteps.step2 || !completedSteps.step3) {
            setError('Por favor, complete todas as etapas antes de criar a conta.');
            setShowNotification(true);
            return;
        }

        try {
            await register(formData);
            setMessage('Registro bem-sucedido!');
            navigate('/login');
        } catch (error) {
            setError(error.message || 'Erro ao registrar.');
            setShowNotification(true);
        }
    };

    const handleIncompleteSteps = (e) => {
        e.preventDefault();
        if (!completedSteps.step1 || !completedSteps.step2 || !completedSteps.step3) {
            setError('Por favor, complete todas as etapas antes de criar a conta.');
            setShowNotification(true);
        } else {
            completeSignup();
        }
    };

    return (
        <div className="signup-page">
            <Header />
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            <div className="signup-container">
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <div>
                                <h1 className="signup-title">Complete os dados para criar sua conta</h1>
                                <div className="steps-list">
                                    <StepButton
                                        icon={iconStep1}
                                        title="Formas de contato"
                                        paragraph="Você vai receber informações sobre sua conta"
                                        isVerified={completedSteps.step1}
                                        onClick={() => navigate('/signup/contact-forms')}
                                    />
                                    <StepButton
                                        icon={iconStep2}
                                        title="Dados pessoais"
                                        paragraph="Será mostrado às pessoas que interagem com você"
                                        isVerified={completedSteps.step2}
                                        onClick={() => navigate('/signup/personal-data')}
                                        disabled={!completedSteps.step1}
                                    />
                                    <StepButton
                                        icon={iconStep3}
                                        title="Criar sua senha"
                                        paragraph="Para manter sua conta protegida e segura"
                                        isVerified={completedSteps.step3}
                                        onClick={() => navigate('/signup/create-password')}
                                        disabled={!completedSteps.step2}
                                    />
                                    <PrivacyNotice />
                                    <div onClick={handleIncompleteSteps} style={{ width: '100%' }}>
                                        <ConfirmationButton 
                                            text="Criar Conta"
                                            backgroundColor={completedSteps.step1 && completedSteps.step2 && completedSteps.step3 ? "#7B33E5" : "#212121"}
                                            type="button"
                                        />
                                    </div>
                                    <div className="login-link">
                                        <a href="/login">Entrar na nilrow</a>
                                    </div>
                                </div>
                            </div>
                        } 
                    />
                    <Route path="contact-forms" element={<Step1 formData={formData} setFormData={setFormData} handleStepCompletion={() => handleStepCompletion('step1')} />} />
                    <Route path="personal-data" element={<Step2 formData={formData} setFormData={setFormData} handleStepCompletion={() => handleStepCompletion('step2')} />} />
                    <Route path="create-password" element={<Step3 formData={formData} setFormData={setFormData} handleStepCompletion={() => handleStepCompletion('step3')} />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

export default Signup;
