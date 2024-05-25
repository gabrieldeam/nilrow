import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '../../../components/Others/PrivacyNotice/PrivacyNotice';
import Notification from '../../../components/UI/Notification/Notification';
import { loginWithPhone } from '../../../services/api';
import { NotificationContext } from '../../../context/NotificationContext';
import './LoginPhone.css';
import Header from '../../../components/Auth/Header/Header';
import Footer from '../../../components/Auth/Footer/Footer';

const LoginPhone = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phoneNumber || !password) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }

        try {
            await loginWithPhone(phoneNumber, password);
            console.log('Login bem-sucedido');
            setMessage('Bem-vindo a nilrow');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Erro ao fazer login.');
            setShowNotification(true);
        }
    };

    return (
        <div className="login-page">
            <Header />
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            <div className="login-container">
                <h1 className="login-title">Entrar na nilrow</h1>
                <form onSubmit={handleSubmit}>
                    <Card 
                        title="Login"
                        rightLink={{ href: "/login", text: "Entrar com nome de usuário ou e-mail" }}
                    >
                        <CustomInput 
                            title="Telefone"
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            value={phoneNumber}
                            type="tel"
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
            <Footer />
        </div>
    );
};

export default LoginPhone;
