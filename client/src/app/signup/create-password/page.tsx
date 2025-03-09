'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import Card from '@/components/UI/Card/Card';
import ConfirmationButton from '@/components/UI/ConfirmationButton/ConfirmationButton';
import Notification from '@/components/UI/Notification/Notification';

import styles from './CreatePassword.module.css';
import { useSignupContext } from '@/context/SignupContext';

// Validação local da senha
const validatePassword = (password: string): string | null => {
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
};

// Cálculo da força da senha
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*()]/.test(password)) strength += 1;
  return strength;
};

export default function CreatePassword() {
  const { formData, setFormData, handleStepCompletion } = useSignupContext();

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Atualiza a força da senha quando formData.password mudar
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    }
  }, [formData.password]);

  // Verifica se os dois campos estão preenchidos
  useEffect(() => {
    const { password = '', confirmPassword = '' } = formData;
    setIsFormValid(password.trim() !== '' && confirmPassword.trim() !== '');
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    [setFormData]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        setShowNotification(true);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem.');
        setShowNotification(true);
        return;
      }

      handleStepCompletion('step3', {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      // handleStepCompletion já redireciona para /signup
    },
    [formData, handleStepCompletion]
  );

  const getPasswordStrengthLabel = useCallback((strength: number) => {
    switch (strength) {
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
  }, []);

  return (
    <div className={styles.createPasswordPage}>
      {showNotification && (
        <Notification
          message={error}
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className={styles.createPasswordPageContainer}>
        <form onSubmit={handleSubmit}>
          <Card title="Senha">
            <CustomInput
              title="Digite sua senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className={styles.passwordStrengthBar}>
              <div className={styles[`strength-${passwordStrength}`]} />
            </div>
            <div className={styles.passwordStrengthLabel}>
              {getPasswordStrengthLabel(passwordStrength)}
            </div>
            <CustomInput
              title="Confirme sua senha"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Card>
          <div className={styles.confirmationButton}>
            <ConfirmationButton
              text="Continuar"
              backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
              type="submit"
            />
          </div>
          <div className={styles.backLink}>
            <Link href="/signup">Voltar sem salvar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
