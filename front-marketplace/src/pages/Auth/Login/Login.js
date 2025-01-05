import React, { useState, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '../../../components/Others/PrivacyNotice/PrivacyNotice';
import { login } from '../../../services/api';

import Notification from '../../../components/UI/Notification/Notification'; 
import { NotificationContext } from '../../../context/NotificationContext'; 

import { LocationContext } from '../../../context/LocationContext'; 

import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner'; 
import './Login.css';

const Login = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const { location } = useContext(LocationContext); // Obter a localização do contexto
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setEmailOrUsername(e.target.value.toLowerCase());
    };

    const getDeviceInfo = () => {
        return navigator.userAgent;
    };

    const formatLocationString = (location) => {
        return `${location.city}/${location.state} - ${location.zip}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailOrUsername || !password) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }
        setLoading(true); // Iniciar carregamento
        try {
            const deviceInfo = getDeviceInfo();
            const locationString = formatLocationString(location);
            await login(emailOrUsername, password, locationString, deviceInfo);
            console.log('Login bem-sucedido');
            setMessage('Bem-vindo a Nilrow');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Erro ao fazer login.');
            setShowNotification(true);
        } finally {
            setLoading(false); // Parar carregamento
        }
    };

    return (
        <div className="login-page">
            <Helmet>
                <title>Login - Nilrow</title>
                <meta name="description" content="Faça login na Nilrow usando seu email ou nome de usuário." />
            </Helmet>
            {loading && <LoadingSpinner />} {/* Exibir spinner durante o carregamento */}
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            <div className="login-container">
                <h1 className="login-title">Entrar na Nilrow</h1>
                <form onSubmit={handleSubmit}>
                    <Card 
                        title="Login"
                        rightLink={{ href: "/login-phone", text: "Entrar com o telefone" }}
                    >
                        <CustomInput 
                            title="E-mail ou nome de usuário"
                            onChange={handleInputChange}
                            value={emailOrUsername}
                            type="text"
                        />
                        <CustomInput 
                            title="Senha"
                            bottomLeftText="Esqueceu sua senha?"
                            bottomRightLink={{ href: "/password-reset", text: "Redefinir senha" }}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                        />
                    </Card>
                    <PrivacyNotice />
                    <ConfirmationButton 
                        text="Login" 
                        backgroundColor="#7B33E5" 
                        type="submit"
                    />
                    <div className="signup-link">
                        <a href="/signup">Criar uma conta</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(Login);
