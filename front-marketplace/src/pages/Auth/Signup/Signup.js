import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import './Signup.css';
import Header from '../../../components/Auth/Header/Header';
import Footer from '../../../components/Auth/Footer/Footer';
import { register } from '../../../services/api';

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
                                <h2>Registro</h2>
                                <div className="steps-list">
                                    <button onClick={() => navigate('/signup/step1')}>
                                        {completedSteps.step1 ? 'Etapa 1 Completa' : 'Preencher Etapa 1'}
                                    </button>
                                    <button onClick={() => navigate('/signup/step2')} disabled={!completedSteps.step1}>
                                        {completedSteps.step2 ? 'Etapa 2 Completa' : 'Preencher Etapa 2'}
                                    </button>
                                    <button onClick={() => navigate('/signup/step3')} disabled={!completedSteps.step2}>
                                        {completedSteps.step3 ? 'Etapa 3 Completa' : 'Preencher Etapa 3'}
                                    </button>
                                    <button onClick={completeSignup} disabled={!completedSteps.step1 || !completedSteps.step2 || !completedSteps.step3}>
                                        Criar Conta
                                    </button>
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