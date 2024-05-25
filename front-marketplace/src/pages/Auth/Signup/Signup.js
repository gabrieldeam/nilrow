import React, { useState } from 'react';
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

    const [step, setStep] = useState(1);

    const nextStep = () => setStep(step + 1);
    const completeSignup = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        // Enviar dados para o backend
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
                {step === 1 && <Step1 formData={formData} setFormData={setFormData} nextStep={nextStep} />}
                {step === 2 && <Step2 formData={formData} setFormData={setFormData} nextStep={nextStep} />}
                {step === 3 && <Step3 formData={formData} setFormData={setFormData} completeSignup={completeSignup} />}
            </div>
            <Footer />
        </div>
    );
};

export default Signup;
