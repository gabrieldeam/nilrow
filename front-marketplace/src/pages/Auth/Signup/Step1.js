import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import Notification from '../../../components/UI/Notification/Notification';
import { Helmet } from 'react-helmet';

const Step1 = ({ formData, setFormData, handleStepCompletion }) => {
    const [isFormValid, setIsFormValid] = useState(false);
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }, [formData, setFormData]);

    const handlePhoneChange = useCallback((value) => {
        setFormData({ ...formData, phone: value });
    }, [formData, setFormData]);

    useEffect(() => {
        const { email, phone } = formData;
        setIsFormValid(email !== '' && phone !== '' && isCheckboxChecked);
    }, [formData, isCheckboxChecked]);

    const navigate = useNavigate();

    const validateEmail = useCallback((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }, []);

    const validatePhone = useCallback((phone) => {
        const regex = /^\+?\d{10,15}$/;
        return regex.test(phone);
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Por favor, preencha todos os campos e aceite os termos.');
            setShowNotification(true);
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor, insira um email válido.');
            setShowNotification(true);
            return;
        }

        if (!validatePhone(formData.phone)) {
            setError('Por favor, insira um telefone válido.');
            setShowNotification(true);
            return;
        }

        handleStepCompletion('step1');
        navigate('/signup');
    }, [isFormValid, validateEmail, validatePhone, formData, handleStepCompletion, navigate]);

    return (
        <div>
            <Helmet>
                <title>Formas de contato - Nilrow</title>
                <meta name="description" content="Faça login na Nilrow usando seu email ou nome de usuário." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            <form onSubmit={handleSubmit}>
                <Card title="E-mail">
                    <CustomInput 
                        title="Digite seu e-mail"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        bottomLeftText="Certifique-se de que você tenha acesso a ele"
                    />
                </Card>
                <Card title="Telefone">
                    <div className="custom-input-container-phone">
                        <label className="input-title-phone">Informe seu telefone</label>
                        <PhoneInput
                            country={'br'}
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            inputProps={{
                                name: 'phone',
                                required: true,
                                autoFocus: true
                            }}
                            inputClass="phone-input"
                            buttonClass="phone-input-button"
                            dropdownClass="phone-input-dropdown"
                            containerClass="phone-input-container"
                        />
                        <div className="input-bottom-text">
                            <span className="bottom-left-phone">Vamos te enviar informações por WhatsApp</span>
                        </div>
                    </div>
                    <div className="checkbox-container roboto-light">
                        <input
                            type="checkbox"
                            id="accept-terms"
                            checked={isCheckboxChecked}
                            onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                        />
                        <label htmlFor="accept-terms">Aceito que entrem em contato comigo via WhatsApp e/ou SMS neste número.</label>
                    </div>
                </Card>
                <div onClick={handleSubmit} style={{ width: '100%' }} className="confirmatioButton-space">
                    <ConfirmationButton 
                        text="Continuar"
                        backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                        type="button"
                    />
                </div>
                <div className="signup-link">
                    <a href="/signup">Voltar sem salvar</a>
                </div>
            </form>
        </div>
    );
};

export default memo(Step1);
