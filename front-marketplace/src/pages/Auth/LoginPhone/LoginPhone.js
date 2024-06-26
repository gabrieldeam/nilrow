import React, { useState, useContext, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '../../../components/Others/PrivacyNotice/PrivacyNotice';
import Notification from '../../../components/UI/Notification/Notification';
import { loginWithPhone } from '../../../services/api';
import { NotificationContext } from '../../../context/NotificationContext';
import { LocationContext } from '../../../context/LocationContext'; // Importar o LocationContext
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner'; // Importar o LoadingSpinner
import './LoginPhone.css';

const LoginPhone = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const { location } = useContext(LocationContext); // Obter a localização do contexto
    const navigate = useNavigate();

    const getDeviceInfo = () => {
        return navigator.userAgent;
    };

    const formatLocationString = (location) => {
        return `${location.city}/${location.state} - ${location.zip}`;
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!phoneNumber || !password) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }
        setLoading(true); // Iniciar carregamento
        try {
            const deviceInfo = getDeviceInfo();
            const locationString = formatLocationString(location);
            await loginWithPhone(phoneNumber, password, locationString, deviceInfo);
            console.log('Login bem-sucedido');
            setMessage('Bem-vindo a nilrow');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Erro ao fazer login.');
            setShowNotification(true);
        } finally {
            setLoading(false); // Parar carregamento
        }
    }, [phoneNumber, password, setMessage, navigate, location]);

    return (
        <div className="loginPhone-page">
            <Helmet>
                <title>Login - Nilrow</title>
                <meta name="description" content="Faça login na Nilrow usando seu email ou nome de usuário." />
            </Helmet>
            {loading && <LoadingSpinner />} {/* Exibir spinner durante o carregamento */}
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            <div className="loginPhone-container">
                <h1 className="loginPhone-title">Entrar na nilrow</h1>
                <form onSubmit={handleSubmit}>
                    <Card 
                        title="Login"
                        rightLink={{ href: "/login", text: "Entrar com nome de usuário ou e-mail" }}
                    >
                        <div className="custom-input-container-loginPhone">
                            <label className="input-title-loginPhone">Telefone</label>
                            <PhoneInput
                                country={'br'}
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                inputProps={{
                                    name: 'phone',
                                    required: true,
                                    autoFocus: true
                                }}
                                inputClass="loginPhone-input"
                                buttonClass="loginPhone-input-button"
                                dropdownClass="loginPhone-input-dropdown"
                                containerClass="loginPhone-input-container"
                            />
                            <div className='space-loginPhone'></div>
                        </div>
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

export default memo(LoginPhone);
