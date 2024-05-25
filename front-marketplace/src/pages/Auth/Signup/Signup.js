import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '../../../components/Others/PrivacyNotice/PrivacyNotice';
import './Signup.css';
import Header from '../../../components/Auth/Header/Header';
import Footer from '../../../components/Auth/Footer/Footer';
import { register } from '../../../services/api';
import iconStep1 from '../../../assets/contato.svg'; // Substitua pelo caminho correto do ícone
import iconStep2 from '../../../assets/user.svg'; // Substitua pelo caminho correto do ícone
import iconStep3 from '../../../assets/tranca.svg'; // Substitua pelo caminho correto do ícone

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

    const navigate = useNavigate();

    const handleStepCompletion = (step) => {
        setCompletedSteps({ ...completedSteps, [step]: true });
        navigate('/signup');
    };

    const completeSignup = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        try {
            await register(formData);
            alert('Registro bem-sucedido!');
            navigate('/login'); // Redireciona para a página de login após o registro bem-sucedido
        } catch (error) {
            alert('Erro ao registrar: ' + error.message);
        }
    };

    return (
        <div className="signup-page">
            <Header />
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
                                        title="Etapa 1"
                                        paragraph="Cadastro do E-mail e Telefone"
                                        isVerified={completedSteps.step1}
                                        onClick={() => navigate('/signup/step1')}
                                    />
                                    <StepButton
                                        icon={iconStep2}
                                        title="Etapa 2"
                                        paragraph="Informações Pessoais"
                                        isVerified={completedSteps.step2}
                                        onClick={() => navigate('/signup/step2')}
                                        disabled={!completedSteps.step1}
                                    />
                                    <StepButton
                                        icon={iconStep3}
                                        title="Etapa 3"
                                        paragraph="Criar Senha"
                                        isVerified={completedSteps.step3}
                                        onClick={() => navigate('/signup/step3')}
                                        disabled={!completedSteps.step2}
                                    />
                                    <PrivacyNotice />
                                    <ConfirmationButton 
                                        text="Criar Conta"
                                        backgroundColor="#7B33E5"
                                        onClick={completeSignup}
                                        type="button"
                                        disabled={!completedSteps.step1 || !completedSteps.step2 || !completedSteps.step3}
                                    />
                                </div>
                            </div>
                        } 
                    />
                    <Route path="step1" element={<Step1 formData={formData} setFormData={setFormData} handleStepCompletion={() => handleStepCompletion('step1')} />} />
                    <Route path="step2" element={<Step2 formData={formData} setFormData={setFormData} handleStepCompletion={() => handleStepCompletion('step2')} />} />
                    <Route path="step3" element={<Step3 formData={formData} setFormData={setFormData} handleStepCompletion={() => handleStepCompletion('step3')} />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

export default Signup;
