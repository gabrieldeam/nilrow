'use client';

import React, { useState, useCallback, useContext, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import CustomInput from '@/components/UI/CustomInput/CustomInput';
import Card from '@/components/UI/Card/Card';
import ConfirmationButton from '@/components/UI/ConfirmationButton/ConfirmationButton';
import StageButton from '@/components/UI/StageButton/StageButton';
import CodeInput from '@/components/UI/CodeInput/CodeInput';
import Notification from '@/components/UI/Notification/Notification';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';

import { sendResetCode, resetPassword } from '@/services/authService';

import { useNotification } from '@/hooks/useNotification';

import styles from './passwordReset.module.css';

function validatePassword(password: string): string | null {
  const specialCharRegex = /[!@#$%^&*()]/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /\d/;
  const minLength = 8;
  const maxLength = 20;

  if (!specialCharRegex.test(password)) {
    return 'A senha deve conter pelo menos um caractere especial (!@#$%^&*()).';
  }
  if (!uppercaseRegex.test(password)) {
    return 'A senha deve conter pelo menos uma letra maiúscula.';
  }
  if (!lowercaseRegex.test(password)) {
    return 'A senha deve conter pelo menos uma letra minúscula.';
  }
  if (!numberRegex.test(password)) {
    return 'A senha deve conter pelo menos um número.';
  }
  if (password.length < minLength || password.length > maxLength) {
    return `A senha deve ter entre ${minLength} e ${maxLength} caracteres.`;
  }
  return null;
}

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*()]/.test(password)) strength += 1;
  return strength;
}

function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return 'Péssimo';
    case 2:
      return 'Fraco';
    case 3:
      return 'Bom';
    case 4:
      return 'Forte';
    case 5:
      return 'Excelente';
    default:
      return '';
  }
}

function PasswordResetPage() {
  const router = useRouter();
  const { setMessage } = useNotification();

  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSendCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
        setError('Por favor, preencha o campo de e-mail.');
        setSuccessMessage('');
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
      } catch (err) {
        setSuccessMessage('');
        setError(
          'Erro ao enviar código de redefinição. Verifique o e-mail e tente novamente.'
        );
        setShowNotification(true);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!resetCode || !newPassword) {
        setError('Por favor, preencha todos os campos.');
        setSuccessMessage('');
        setShowNotification(true);
        return;
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setError(passwordError);
        setSuccessMessage('');
        setShowNotification(true);
        return;
      }

      setLoading(true);
      try {
        await resetPassword({ email, token: resetCode, newPassword });
        setError('');
        setSuccessMessage('Senha redefinida com sucesso.');
        setMessage && setMessage('Senha redefinida com sucesso.');
        router.push('/login');
      } catch (err) {
        setSuccessMessage('');
        setError(
          'Erro ao redefinir senha. Verifique o código e tente novamente.'
        );
        setShowNotification(true);
      } finally {
        setLoading(false);
      }
    },
    [email, resetCode, newPassword, router, setMessage]
  );

  const handleResendCode = useCallback(async () => {
    if (!email) {
      setError('Por favor, preencha o campo de e-mail.');
      setSuccessMessage('');
      setShowNotification(true);
      return;
    }
    setLoading(true);
    try {
      await sendResetCode(email);
      setError('');
      setSuccessMessage('Novo código de redefinição enviado para o seu e-mail.');
      setShowNotification(true);
    } catch (err) {
      setSuccessMessage('');
      setError(
        'Erro ao enviar novo código de redefinição. Verifique o e-mail e tente novamente.'
      );
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);
    setPasswordStrength(calculatePasswordStrength(newPasswordValue));
  };

  return (
    <div className={styles['password-reset-page']}>
      <Head>
        <title>Redefinir senha - Nilrow</title>
        <meta
          name="description"
          content="Faça login na Nilrow usando seu email ou nome de usuário."
        />
      </Head>

      {loading && <LoadingSpinner />}
      {showNotification && (error || successMessage) && (
        <Notification
          message={error || successMessage}
          onClose={() => setShowNotification(false)}
          backgroundColor={successMessage ? '#4FBF0A' : '#DF1414'}
        />
      )}

      <div className={styles['password-reset-container']}>
        <h1 className={styles['password-reset-title']}>Esqueceu sua senha?</h1>
        
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
                <CodeInput length={6} onChange={(value) => setResetCode(value)} />

                <StageButton
                  text="Enviar novo código"
                  backgroundColor="#7B33E5"
                  onClick={handleResendCode}
                />

                <CustomInput
                  title="Nova Senha"
                  onChange={handleNewPasswordChange}
                  value={newPassword}
                  type="password"
                />
                <div className={styles['password-strength-bar']}>
                  <div className={`strength-${passwordStrength}`}></div>
                </div>
                <div className={styles['password-strength-label']}>
                  {getPasswordStrengthLabel(passwordStrength)}
                </div>
              </>
            )}
          </Card>

          <div className={styles['confirmationButton-space']}>
            <ConfirmationButton
              text={codeSent ? 'Redefinir Senha' : 'Enviar Código'}
              backgroundColor="#7B33E5"
              type="submit"
            />
          </div>

          <div className={styles['reset-login-link']}>
            <Link href="/login">Fazer Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(PasswordResetPage);
