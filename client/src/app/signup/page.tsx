'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StepButton from '../../components/UI/StepButton/StepButton';
import ConfirmationButton from '../../components/UI/ConfirmationButton/ConfirmationButton';
import PrivacyNotice from '../../components/UI/PrivacyNotice/PrivacyNotice';
import Notification from '../../components/UI/Notification/Notification';
import { SignupFormData } from '../../types/pages/Signup';
import { register } from '../../services/authService';
import LoadingSpinner from '../../components/UI/LoadingSpinner/LoadingSpinner';
import styles from './Signup.module.css';

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    phone: '',
    name: '',
    cpf: '',
    birthDate: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });

  const [completedSteps, setCompletedSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  const handleStepCompletion = useCallback(
    (step: string, data?: Partial<SignupFormData>) => {
      setCompletedSteps((prev) => ({ ...prev, [step]: true }));
      setFormData((prev) => ({ ...prev, ...data }));
      router.push('/signup');
    },
    [router]
  );

  const completeSignup = useCallback(async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      setShowNotification(true);
      return;
    }

    if (!completedSteps.step1 || !completedSteps.step2 || !completedSteps.step3) {
      setError('Por favor, complete todas as etapas antes de criar a conta.');
      setShowNotification(true);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSubmit } = formData;
      await register(dataToSubmit);
      router.push('/login');
    } catch (err) {
      setError('Erro ao criar a conta. Tente novamente.');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  }, [formData, completedSteps, router]);

  return (
    <div className={styles.signupPage}>
      {loading && <LoadingSpinner />}
      {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
      <div className={styles.signupContainer}>
        <h1 className={styles.signupTitle}>Complete os dados para criar sua conta</h1>
        <div className={styles.stepsList}>
          <StepButton
            icon="/assets/contato.svg"
            title="Formas de contato"
            paragraph="Você vai receber informações sobre sua conta"
            isVerified={completedSteps.step1}
            onClick={() => router.push('/signup/contact-forms')}
          />
          <StepButton
            icon="/assets/user.svg"
            title="Dados pessoais"
            paragraph="Será mostrado às pessoas que interagem com você"
            isVerified={completedSteps.step2}
            onClick={() => router.push('/signup/personal-data')}
            disabled={!completedSteps.step1}
          />
          <StepButton
            icon="/assets/tranca.svg"
            title="Criar sua senha"
            paragraph="Para manter sua conta protegida e segura"
            isVerified={completedSteps.step3}
            onClick={() => router.push('/signup/create-password')}
            disabled={!completedSteps.step2}
          />
          <PrivacyNotice />
          <div className={styles.confirmationButton}>
            <ConfirmationButton
              text="Criar Conta"
              backgroundColor={
                completedSteps.step1 && completedSteps.step2 && completedSteps.step3 ? '#7B33E5' : '#212121'
              }
              onClick={completeSignup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
