import React, { useState, useContext, useCallback, memo } from 'react'; // Removido o 'useEffect'
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import CodeInput from '../../../components/UI/Inputs/CodeInput/CodeInput';
import { sendResetCode, resetPassword } from '../../../services/api';
import Notification from '../../../components/UI/Notification/Notification';
import { NotificationContext } from '../../../context/NotificationContext';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import './PasswordReset.css';

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

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleSendCode = useCallback(async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Por favor, preencha o campo de e-mail.');
            setSuccessMessage('');
            setShowNotification(true);
            return;
        }
        setLoading(true);
        try {
            await sendResetCode(email);
            setCodeSent(true);
            setError('');
            setSuccessMessage('Código de redefinição enviado para o seu e-mail.');
            setShowNotification(true);
        } catch (error) {
            setSuccessMessage('');
            setError('Erro ao enviar código de redefinição. Verifique o e-mail e tente novamente.');
            setShowNotification(true);
        } finally {
            setLoading(false);
        }
    }, [email]);

    const handleResetPassword = useCallback(async (e) => {
        e.preventDefault();
        if (!resetCode || !newPassword) {
            setError('Por favor, preencha todos os campos.');
            setSuccessMessage('');
            setShowNotification(true);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            setSuccessMessage('');
            setShowNotification(true);
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ email, resetCode, newPassword });
            setError('');
            setSuccessMessage('Senha redefinida com sucesso.');
            setMessage('Senha redefinida com sucesso.');
            navigate('/login');
        } catch (error) {
            setSuccessMessage('');
            setError('Erro ao redefinir senha. Verifique o código e tente novamente.');
            setShowNotification(true);
        } finally {
            setLoading(false);
        }
    }, [email, resetCode, newPassword, setMessage, navigate]);

    const handleResendCode = useCallback(async () => {
        if (!email) {
            setError('Por favor, preencha o campo de e-mail.');
            setSuccessMessage('');
            setShowNotification(true);
            return;
        }
        setLoading(true);
        try {
            await sendResetCode(email);
            setError('');
            setSuccessMessage('Novo código de redefinição enviado para o seu e-mail.');
            setShowNotification(true);
        } catch (error) {
            setSuccessMessage('');
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
        <div className="password-reset-page">
            <Helmet>
                <title>Redefinir senha - Nilrow</title>
                <meta name="description" content="Faça login na Nilrow usando seu email ou nome de usuário." />
            </Helmet>
            {loading && <LoadingSpinner />}
            {showNotification && (error || successMessage) && (
                <Notification
                    message={error || successMessage}
                    onClose={() => setShowNotification(false)}
                    backgroundColor={successMessage ? "#4FBF0A" : "#DF1414"}
                />
            )}
            <div className="password-reset-container">
                <h1 className="password-reset-title">Esqueceu sua senha?</h1>
                <form onSubmit={codeSent ? handleResetPassword : handleSendCode}>
                    <Card title="Redefinir">
                        <CustomInput
                            title="E-mail"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            disabled={codeSent}
                        />
                        {codeSent && (
                            <>
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
                                <div className="password-strength-bar">
                                    <div className={`strength-${passwordStrength}`}></div>
                                </div>
                                <div className="password-strength-label">
                                    {getPasswordStrengthLabel(passwordStrength)}
                                </div>
                            </>
                        )}
                    </Card>
                    <div className="confirmationButton-space">
                        <ConfirmationButton
                            text={codeSent ? "Redefinir Senha" : "Enviar Código"}
                            backgroundColor="#7B33E5"
                            type="submit"
                        />
                    </div>
                    <div className="reset-login-link">
                        <a href="/login">Fazer Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(PasswordReset);
