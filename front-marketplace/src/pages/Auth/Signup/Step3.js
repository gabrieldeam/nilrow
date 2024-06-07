import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import Notification from '../../../components/UI/Notification/Notification';

const Step3 = ({ formData, setFormData, handleStepCompletion }) => {
    const [isFormValid, setIsFormValid] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    useEffect(() => {
        const { password, confirmPassword } = formData;
        setIsFormValid(password !== '' && confirmPassword !== '');
    }, [formData]);

    const navigate = useNavigate();

    const validatePassword = (password) => {
        const specialCharRegex = /[!@#$%^&*()]/;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /\d/;
        const minLength = 8;
        const maxLength = 20;

        if (!specialCharRegex.test(password)) {
            return 'A senha deve conter pelo menos um caractere especial (!@#$%^&*()).';
        }
        if (!uppercaseRegex.test(password)) {
            return 'A senha deve conter pelo menos uma letra maiúscula.';
        }
        if (!lowercaseRegex.test(password)) {
            return 'A senha deve conter pelo menos uma letra minúscula.';
        }
        if (!numberRegex.test(password)) {
            return 'A senha deve conter pelo menos um número.';
        }
        if (password.length < minLength || password.length > maxLength) {
            return `A senha deve ter entre ${minLength} e ${maxLength} caracteres.`;
        }
        return null;
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[!@#$%^&*()]/.test(password)) strength += 1;
        return strength;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            setShowNotification(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setShowNotification(true);
            return;
        }

        const { confirmPassword, ...dataToSubmit } = formData;

        handleStepCompletion('step3', dataToSubmit);
        navigate('/signup');
    };

    const getPasswordStrengthLabel = (strength) => {
        switch (strength) {
            case 0:
            case 1:
                return 'Péssimo';
            case 2:
                return 'Fraco';
            case 3:
                return 'Bom';
            case 4:
                return 'Forte';
            case 5:
                return 'Excelente';
            default:
                return '';
        }
    };

    return (
        <div>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            <form onSubmit={handleSubmit}>
                <Card title="Senha">
                    <CustomInput 
                        title="Digite sua senha"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <div className="password-strength-bar">
                        <div className={`strength-${passwordStrength}`}></div>
                    </div>
                    <div className="password-strength-label">
                        {getPasswordStrengthLabel(passwordStrength)}
                    </div>
                    <CustomInput 
                        title="Confirme sua senha"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
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

export default Step3;
