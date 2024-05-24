import React, { useState } from 'react';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '../../../components/Others/PrivacyNotice/PrivacyNotice';
import Notification from '../../../components/UI/Notification/Notification';
import { login } from '../../../services/api';
import './Login.css';
import Header from '../../../components/Auth/Header/Header';
import Footer from '../../../components/Auth/Footer/Footer';

const Login = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailOrUsername || !password) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }

        try {
            const data = await login(emailOrUsername, password);
            console.log('Login bem-sucedido:', data);
            // Redirecionar para outra página ou salvar o token, etc.
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
                        rightLink={{ href: "/login-phone", text: "Entrar com o telefone" }}
                    >
                        <CustomInput 
                            title="E-mail ou nome de usuário"
                            onChange={(e) => setEmailOrUsername(e.target.value)}
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
            <Footer />
        </div>
    );
};

export default Login;
