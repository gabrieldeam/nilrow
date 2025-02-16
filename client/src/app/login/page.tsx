'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import Card from '@/components/UI/Card/Card';
import ConfirmationButton from '@/components/UI/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '@/components/UI/PrivacyNotice/PrivacyNotice';
import Notification from '@/components/UI/Notification/Notification';
import { useNotification } from '@/hooks/useNotification';
import { useLocationContext } from '@/context/LocationContext';
import { login } from '@/services/authService';
import styles from './Login.module.css';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setMessage } = useNotification();
  const { location } = useLocationContext();
  const router = useRouter();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrUsername(e.target.value.toLowerCase());
  }, []);

  const getDeviceInfo = () => navigator.userAgent;

  const formatLocationString = (location: any) => {
    return `${location.city}/${location.state} - ${location.zip}`;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!emailOrUsername || !password) {
        setError('Por favor, preencha todos os campos.');
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
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Erro ao fazer login.');
      } finally {
        setLoading(false);
      }
    },
    [emailOrUsername, password, location, router, setMessage]
  );

  return (
    <div className={styles.loginPage}>
      {loading && <LoadingSpinner />}
      {error && <Notification message={error} onClose={() => setError('')} />}
      <div className={styles.loginContainer}>
        <h1 className={styles.loginTitle}>Entrar na Nilrow</h1>
        <form onSubmit={handleSubmit}>
          <Card
            title="Login"
            rightLink={{ href: '/login-phone', text: 'Entrar com o telefone' }}
          >
            <CustomInput
              title="E-mail ou nome de usuário"
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
              value={emailOrUsername}
              type="text"
            />
            <CustomInput
              title="Senha"
              bottomLeftText="Esqueceu sua senha?"
              bottomRightLink={{ href: '/password-reset', text: 'Redefinir senha' }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
            />
          </Card>
          <PrivacyNotice />
          <ConfirmationButton text="Login" backgroundColor="#7B33E5" type="submit" />
          <div className={styles.signupLink}>
            <a href="/signup">Criar uma conta</a>
          </div>
        </form>
      </div>
    </div>
  );
}
