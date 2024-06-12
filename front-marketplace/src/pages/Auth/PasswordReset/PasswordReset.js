import React, { useState, useContext, useCallback, memo } from 'react';
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

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleSendCode = useCallback(async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Por favor, preencha o campo de e-mail.');
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
        setLoading(true); 
        try {
            await sendResetCode(email);
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
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    value={newPassword}
                                    type="password"
                                />
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
