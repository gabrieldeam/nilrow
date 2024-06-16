import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import DateInput from '../../../components/UI/Inputs/DateInput/DateInput';
import 'react-phone-input-2/lib/style.css';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../components/UI/Notification/Notification';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import { Helmet } from 'react-helmet-async';
import { getUserProfile, updateUserProfile } from '../../../services/profileApi';
import { sendResetCode, resetPassword } from '../../../services/api';
import CodeInput from '../../../components/UI/Inputs/CodeInput/CodeInput';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';
import './EditData.css';

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

const EditData = () => {
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        birthDate: ''
    });
    const [originalData, setOriginalData] = useState({
        name: '',
        cpf: '',
        birthDate: ''
    });
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const [isFormValid, setIsFormValid] = useState(false);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userProfile = await getUserProfile();
                setFormData({
                    name: userProfile.name,
                    cpf: userProfile.cpf,
                    birthDate: userProfile.birthDate
                });
                setOriginalData({
                    name: userProfile.name,
                    cpf: userProfile.cpf,
                    birthDate: userProfile.birthDate
                });
                setEmail(userProfile.email);
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }, [formData]);

    const handleEmailChange = useCallback((e) => {
        const { value } = e.target;
        setEmail(value);
    }, []);

    useEffect(() => {
        const { name, cpf, birthDate } = formData;
        setIsFormValid(name !== '' && cpf !== '' && birthDate !== '');
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!isFormValid) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }

        const updatedProfileData = {
            name: formData.name !== originalData.name ? formData.name : null,
            cpf: formData.cpf !== originalData.cpf ? formData.cpf : null,
            birthDate: formData.birthDate !== originalData.birthDate ? formData.birthDate : null,
        };

        try {
            await updateUserProfile(updatedProfileData);
            setSuccessMessage('Dados atualizados com sucesso!');
            setShowNotification(true);
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            setError(error.response?.data?.message || 'Erro ao atualizar dados. Tente novamente.');
            setShowNotification(true);
        }
    }, [formData, isFormValid, originalData]);

    const handleResetPassword = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!resetCode || !newPassword) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            setShowNotification(true);
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ email, resetCode, newPassword });
            setSuccessMessage('Senha redefinida com sucesso.');
            setShowNotification(true);
        } catch (error) {
            setError('Erro ao redefinir senha. Verifique o código e tente novamente.');
            setShowNotification(true);
        } finally {
            setLoading(false);
        }
    }, [email, resetCode, newPassword]);

    const handleResendCode = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await sendResetCode(email);
            setSuccessMessage('Novo código de redefinição enviado para o seu e-mail.');
            setShowNotification(true);
        } catch (error) {
            setError('Erro ao enviar novo código de redefinição. Verifique o e-mail e tente novamente.');
            setShowNotification(true);
        } finally {
            setLoading(false);
        }
    }, [email]);

    const handleNewPasswordChange = (e) => {
        const newPassword = e.target.value;
        setNewPassword(newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
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
        <div className="edit-data-page">
            <Helmet>
                <title>Editar Dados - Nilrow</title>
                <meta name="description" content="Edite seu perfil na Nilrow." />
            </Helmet>
            {showNotification && (
                <Notification
                    message={error || successMessage}
                    onClose={() => setShowNotification(false)}
                    backgroundColor={error ? '#DF1414' : '#4FBF0A'}
                />
            )}
            {loading && <LoadingSpinner />}
            {isMobile && (
                <MobileHeader title="Editar dados" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="edit-data-container">
                <SubHeader title="Editar dados" handleBack={handleBack} />
                <form onSubmit={handleSubmit}>
                    <Card title="Alterar">
                        <CustomInput 
                            title="Nome completo"
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
                        />
                        <DateInput 
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            bottomLeftText="Sua data de nascimento não será divulgada."
                        />
                    </Card>
                    <div onClick={handleSubmit} style={{ width: '100%' }} className="confirmationButton-space">
                        <StageButton
                            text="Editar dados"
                            backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                            type="button"
                        />
                    </div>
                </form>
                <form onSubmit={handleResetPassword}>
                    <Card title="Redefinir Senha">
                        <CustomInput
                            title="E-mail"
                            value={email}
                            type="email"
                            onChange={handleEmailChange}
                            disabled
                        />
                        <label className="input-title">Código de Redefinição</label>
                        <CodeInput
                            length={6}
                            onChange={(value) => setResetCode(value)}
                        />
                        <StageButton
                            text="Enviar novo código"
                            backgroundColor="#7B33E5"
                            onClick={handleResendCode}
                            imageSrc="/path/to/icon.png"
                        />
                        <CustomInput
                            title="Nova Senha"
                            onChange={handleNewPasswordChange}
                            value={newPassword}
                            type="password"
                        />
                        <div className="password-data-strength-bar">
                            <div className={`strength-${passwordStrength}`}></div>
                        </div>
                        <div className="password-data-strength-label">
                            {getPasswordStrengthLabel(passwordStrength)}
                        </div>
                    </Card>
                    <div className="confirmationButton-space">
                        <StageButton
                            text="Redefinir Senha"
                            backgroundColor="#7B33E5"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(EditData);
