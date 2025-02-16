'use client';

import React, { memo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import Card from '@/components/UI/Card/Card';
import ConfirmationButton from '@/components/UI/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '@/components/UI/PrivacyNotice/PrivacyNotice';
import Notification from '@/components/UI/Notification/Notification';
import { loginWithPhone } from '@/services/authService';
import { useNotification } from '@/hooks/useNotification';
import { useLocationContext } from '@/context/LocationContext';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';
import styles from './LoginPhone.module.css';

const LoginPhonePage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setMessage } = useNotification();
  const { location } = useLocationContext();
  const router = useRouter();

  const getDeviceInfo = () => navigator.userAgent;

  const formatLocationString = (location: any) => `${location.city}/${location.state} - ${location.zip}`;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!phoneNumber || !password) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      setLoading(true);
      try {
        const deviceInfo = getDeviceInfo();
        const locationString = formatLocationString(location);
        await loginWithPhone(phoneNumber, password, locationString, deviceInfo);
        setMessage('Bem-vindo a Nilrow', 'success');
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Erro ao fazer login.');
      } finally {
        setLoading(false);
      }
    },
    [phoneNumber, password, location, router, setMessage]
  );

  return (
    <div className={styles.loginPhonePage}>
      {loading && <LoadingSpinner />}
      {error && <Notification message={error} onClose={() => setError('')} />}
      <div className={styles.loginPhoneContainer}>
        <h1 className={styles.loginPhoneTitle}>Entrar na Nilrow</h1>
        <form onSubmit={handleSubmit}>
          <Card
            title="Login"
            rightLink={{ href: '/login', text: 'Entrar com nome de usuário ou e-mail' }}
          >
            <div className={styles.customInputContainer}>
              <label className={styles.inputTitle}>Telefone</label>
              <PhoneInput
                country="br"
                value={phoneNumber}
                onChange={setPhoneNumber}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                }}
                inputClass={styles.loginPhoneInput}
                buttonClass={styles.loginPhoneButton}
                dropdownClass={styles.loginPhoneDropdown}
                containerClass={styles.loginPhoneContainerClass}
              />
              <div className={styles.space}></div>
            </div>
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
};

export default memo(LoginPhonePage);
