import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import DateInput from '../../../components/UI/DateInput/DateInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import Notification from '../../../components/UI/Notification/Notification';

const Step2 = ({ formData, setFormData, handleStepCompletion }) => {
    const [isFormValid, setIsFormValid] = useState(false);
    const [nicknameValid, setNicknameValid] = useState(null);
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'nickname') {
            validateNickname(value);
        }
    };

    useEffect(() => {
        const { name, cpf, birthDate, nickname } = formData;
        setIsFormValid(name !== '' && cpf !== '' && birthDate !== '' && nickname !== '' && nicknameValid);
    }, [formData, nicknameValid]);

    const navigate = useNavigate();

    const validateCPF = (cpf) => {
        const regex = /^\d{11}$/;
        return regex.test(cpf);
    };

    const validateNickname = (nickname) => {
        const regex = /^[a-z][a-z0-9._]{2,28}[a-z0-9]$/;
        const hasNoConsecutiveSpecialChars = !/([._])\1/.test(nickname);
        setNicknameValid(regex.test(nickname) && hasNoConsecutiveSpecialChars);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }

        if (!validateCPF(formData.cpf)) {
            setError('Por favor, insira um CPF válido.');
            setShowNotification(true);
            return;
        }

        handleStepCompletion('step2');
        navigate('/signup');
    };

    return (
        <div>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            <form onSubmit={handleSubmit}>
                <Card title="Dados">
                    <CustomInput 
                        title="Seu nome completo"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <CustomInput 
                        title="CPF"
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        bottomLeftText="Apenas números, sem pontos ou traços"
                    />
                </Card>
                <Card title="Aniversário">
                    <DateInput 
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        bottomLeftText="Sua data de nascimento não será divulgada."
                    />
                </Card>
                <Card title="Identificação única">
                    <CustomInput 
                        title="Nome de usuário"
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        isValid={nicknameValid}
                        prefix="nilrow.com/@"
                    />
                </Card>
                <div onClick={handleSubmit} style={{ width: '100%' }} className="confirmatioButton-space">
                    <ConfirmationButton 
                        text="Continuar"
                        backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                        type="button"
                    />
                </div>
                <div className="login-link">
                    <a href="/signup">Voltar sem salvar</a>
                </div>
            </form>
        </div>
    );
};

export default Step2;
