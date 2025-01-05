'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import ConfirmationButton from '../../../components/UI/ConfirmationButton/ConfirmationButton';
import Notification from '../../../components/UI/Notification/Notification';
import { StepProps, SignupFormData } from '../../../types/pages/Signup';
import styles from './CreatePassword.module.css';

// Função que valida a senha e retorna uma string de erro ou null se estiver tudo certo
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

// Função que calcula a “força” da senha
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*()]/.test(password)) strength += 1;

  return strength;
};

const CreatePassword: React.FC<StepProps> = ({
  // Define aqui o valor padrão para garantir que as propriedades existam
  formData = { password: '', confirmPassword: '' },
  setFormData,
  handleStepCompletion
}) => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  // Inicializa os valores de password e confirmPassword caso sejam undefined
  useEffect(() => {
    if (setFormData) {
      setFormData((prevData: SignupFormData) => ({
        ...prevData,
        password: prevData?.password || '',
        confirmPassword: prevData?.confirmPassword || '',
      }));
    }
  }, [setFormData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (setFormData) {
        setFormData((prevData: SignupFormData) => ({
          ...prevData,
          [name]: value,
        }));
      }

      // Atualiza a força da senha sempre que o campo "password" mudar
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value));
      }
    },
    [setFormData]
  );

  // Verifica se os dois campos estão preenchidos
  useEffect(() => {
    const { password = '', confirmPassword = '' } = formData;
    setIsFormValid(password.trim() !== '' && confirmPassword.trim() !== '');
  }, [formData]);

  // Ao clicar em “Continuar”
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const passwordError = validatePassword(formData.password);

      // Se a senha for inválida, mostra notificação
      if (passwordError) {
        setError(passwordError);
        setShowNotification(true);
        return;
      }

      // Verifica se as senhas coincidem
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem.');
        setShowNotification(true);
        return;
      }

      // Chama função para avançar o passo e redireciona
      if (handleStepCompletion) {
        handleStepCompletion('step3');
      }
      router.push('/signup');
    },
    [formData, handleStepCompletion, router]
  );

  // Função auxiliar para mostrar o texto da força da senha
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
              <div className={styles[`strength-${passwordStrength}`]}></div>
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
            <a href="/signup">Voltar sem salvar</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePassword;
