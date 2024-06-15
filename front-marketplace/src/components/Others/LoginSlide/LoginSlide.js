import React, { useState, useContext } from 'react';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/Buttons/ConfirmationButton/ConfirmationButton';
import { login } from '../../../services/api';
import { NotificationContext } from '../../../context/NotificationContext';
import './LoginSlide.css';

const LoginSlide = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setMessage } = useContext(NotificationContext);

    const handleInputChange = (e) => {
        setEmailOrUsername(e.target.value.toLowerCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailOrUsername || !password) {
            setMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }
        try {
            await login(emailOrUsername, password);
            setMessage('Bem-vindo a Nilrow', 'success');
            setTimeout(() => {
                window.location.reload(); // Atualiza a página após login bem-sucedido
            }, 1000);
        } catch (err) {
            setMessage(err.message || 'Erro ao fazer login.', 'error');
        }
    };

    return (
        <div className="login-slide">
            <div className="login-slide-container">
                <h1 className="login-slide-title">Entrar na Nilrow</h1>
                <p className="login-slide-description">Gerencie sua conta, verifique notificações, comente em vídeos e muito mais, tudo do seu computador.</p>
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
                    <div className="confirmationButton-space">
                        <ConfirmationButton 
                            text="Login" 
                            backgroundColor="#7B33E5" 
                            type="submit"
                            className="login-button"
                        />
                    <div className="signup-slide-link">
                        <a href="/signup">Criar uma conta</a>
                    </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginSlide;
