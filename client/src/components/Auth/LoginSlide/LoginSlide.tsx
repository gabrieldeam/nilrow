'use client';

import React, { useState } from 'react';
import CustomInput from '../../UI/CustomInput/CustomInput';
import Card from '../../UI/Card/Card';
import ConfirmationButton from '../../UI/ConfirmationButton/ConfirmationButton';
import LoadingSpinner from '../../UI/LoadingSpinner/LoadingSpinner';
import { useNotification } from '../../../hooks/useNotification';
import { useLocationContext } from '../../../context/LocationContext';
import { login } from '../../../services/authService'; // Importar a função login
import styles from './LoginSlide.module.css';

const LoginSlide: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setMessage } = useNotification();
  const { location } = useLocationContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrUsername(e.target.value.toLowerCase());
  };

  const getDeviceInfo = () => navigator.userAgent;

  const formatLocationString = (location: any) => `${location.city}/${location.state} - ${location.zip}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setMessage('Por favor, preencha todos os campos.', 'error');
      return;
    }
    setLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const locationString = formatLocationString(location);
      await login({
        login: emailOrUsername,
        password,
        location: locationString,
        device: deviceInfo,
      });
      setMessage('Bem-vindo a Nilrow', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setMessage(err.message || 'Erro ao fazer login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginSlide}>
      {loading && <LoadingSpinner />}
      <div className={styles.loginSlideContainer}>
        <h1 className={styles.loginSlideTitle}>Entrar na Nilrow</h1>
        <p className={styles.loginSlideDescription}>
          Gerencie sua conta, verifique notificações, comente em vídeos e muito mais, tudo do seu computador.
        </p>
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
          <div className={styles.confirmationButtonSpace}>
            <ConfirmationButton text="Login" backgroundColor="#7B33E5" type="submit" />
            <div className={styles.signupSlideLink}>
              <a href="/signup">Criar uma conta</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSlide;
