'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import CustomInput from '@/components/UI/CustomInput/CustomInput';
import DateInput from '@/components/UI/DateInput/DateInput';
import Card from '@/components/UI/Card/Card';
import ConfirmationButton from '@/components/UI/ConfirmationButton/ConfirmationButton';
import Notification from '@/components/UI/Notification/Notification';

import styles from './PersonalData.module.css';
import { useSignupContext } from '../layout';

const validateCPF = (cpf: string): boolean => {
  const regex = /^\d{11}$/;
  return regex.test(cpf);
};

const validateNickname = (nickname: string): boolean => {
  const regex = /^[a-z][a-z0-9._]{2,28}[a-z0-9]$/;
  const hasNoConsecutiveSpecialChars = !/([._])\1/.test(nickname);
  return regex.test(nickname) && hasNoConsecutiveSpecialChars;
};

export default function PersonalData() {
  const router = useRouter();

  const {
    formData,
    setFormData,
    handleStepCompletion,
  } = useSignupContext();

  const [nicknameValid, setNicknameValid] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
      const { name, value } = e.target;
      // Atualiza o formData no contexto
      setFormData((prevData) => ({
        ...prevData,
        [name]: name === 'nickname' ? value.toLowerCase() : value
      }));

      // Valida nickname enquanto digita
      if (name === 'nickname') {
        setNicknameValid(validateNickname(value.toLowerCase()));
      }
    },
    [setFormData]
  );

  // Dispara toda vez que formData muda
  useEffect(() => {
    const { name, cpf, birthDate, nickname } = formData;
    const allFilled = (
      name?.trim() &&
      cpf?.trim() &&
      birthDate?.trim() &&
      nickname?.trim() &&
      nicknameValid === true
    );
    setIsFormValid(!!allFilled);
  }, [formData, nicknameValid]);

  // Garante que nickname seja validado na montagem
  useEffect(() => {
    if (formData.nickname) {
      setNicknameValid(validateNickname(formData.nickname));
    }
  }, [formData.nickname]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isFormValid) {
        setError('Por favor, preencha todos os campos corretamente.');
        setShowNotification(true);
        return;
      }

      if (!validateCPF(formData.cpf || '')) {
        setError('Por favor, insira um CPF válido.');
        setShowNotification(true);
        return;
      }

      handleStepCompletion('step2', {
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        nickname: formData.nickname,
      });
      // O handleStepCompletion já faz router.push('/signup');
    },
    [isFormValid, formData, handleStepCompletion]
  );

  return (
    <div className={styles.personalDataPage}>
      {showNotification && (
        <Notification
          message={error}
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className={styles.personalDataPageContainer}>
        <form onSubmit={handleSubmit}>
          <Card title="Dados">
            <CustomInput
              title="Seu nome completo"
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
            />
            <CustomInput
              title="CPF"
              type="text"
              name="cpf"
              value={formData.cpf || ''}
              onChange={handleChange}
              bottomLeftText="Apenas números, sem pontos ou traços"
            />
          </Card>
          <Card title="Aniversário">
            <DateInput
              name="birthDate"
              value={formData.birthDate || ''}
              onChange={handleChange}
              bottomLeftText="Sua data de nascimento não será divulgada."
            />
          </Card>
          <Card title="Identificação única">
            <CustomInput
              title="Nome de usuário"
              type="text"
              name="nickname"
              value={formData.nickname || ''}
              onChange={handleChange}
              isValid={nicknameValid !== undefined ? nicknameValid : false}
              prefix="nilrow.com/@"
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
}
