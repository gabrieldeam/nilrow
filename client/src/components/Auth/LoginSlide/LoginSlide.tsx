'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CustomInput from '../../UI/CustomInput/CustomInput';
import Card from '../../UI/Card/Card';
import ConfirmationButton from '../../UI/ConfirmationButton/ConfirmationButton';
import LoadingSpinner from '../../UI/LoadingSpinner/LoadingSpinner';
import { useNotification } from '../../../hooks/useNotification';
import { useLocationContext } from '../../../context/LocationContext';
import { login } from '../../../services/authService';
import styles from './LoginSlide.module.css';

// Definindo interface para a localização
interface Location {
  city: string;
  state: string;
  zip: string;
}

const LoginSlide: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setMessage } = useNotification();
  const { location } = useLocationContext();

  // Atualizamos o tipo do parâmetro para aceitar input ou textarea
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEmailOrUsername(e.target.value.toLowerCase());
  };

  const getDeviceInfo = () => navigator.userAgent;

  // Tipamos o parâmetro location com a interface definida
  const formatLocationString = (location: Location) =>
    `${location.city}/${location.state} - ${location.zip}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setMessage('Por favor, preencha todos os campos.', 'error');
      return;
    }
    setLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const locationString = formatLocationString(location as Location);
      await login({
        login: emailOrUsername,
        password,
        location: locationString,
        device: deviceInfo,
      });
      setMessage('Bem-vindo a Nilrow', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message || 'Erro ao fazer login.', 'error');
      } else {
        setMessage('Erro ao fazer login.', 'error');
      }
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
              <Link href="/signup">Criar uma conta</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSlide;
