'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import CustomInput from '@/components/UI/CustomInput/CustomInput';
import Card from '@/components/UI/Card/Card';
import ConfirmationButton from '@/components/UI/ConfirmationButton/ConfirmationButton';
import Notification from '@/components/UI/Notification/Notification';

import styles from './ContactForms.module.css';

// Importa o hook do contexto
import { useSignupContext } from '../layout';

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const regex = /^\+?\d{10,15}$/;
  return regex.test(phone);
};

export default function ContactForms() {
  const router = useRouter();

  // Pega do contexto
  const {
    formData,
    setFormData,
    handleStepCompletion
  } = useSignupContext();

  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    },
    [setFormData]
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      setFormData((prevData) => ({ ...prevData, phone: value }));
    },
    [setFormData]
  );

  useEffect(() => {
    const { email = '', phone = '' } = formData;
    setIsFormValid(validateEmail(email) && validatePhone(phone));
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!isFormValid) {
        setError('Por favor, preencha todos os campos corretamente.');
        setShowNotification(true);
        return;
      }

      // Passamos dados parciais se quisermos
      handleStepCompletion('step1', {
        email: formData.email,
        phone: formData.phone,
        acceptsSms: formData.acceptsSms,
      });
      // O handleStepCompletion já faz router.push('/signup');
    },
    [isFormValid, formData, handleStepCompletion]
  );

  return (
    <div className={styles.contactFormsPage}>
      {showNotification && (
        <Notification
          message={error}
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className={styles.contactFormsPageContainer}>
        <form onSubmit={handleSubmit}>
          <Card title="E-mail">
            <CustomInput
              title="Digite seu e-mail"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              bottomLeftText="Certifique-se de que você tenha acesso a ele"
            />
          </Card>
          <Card title="Telefone">
            <div className={styles.phoneInputContainer}>
              <label className={styles.inputTitle}>Informe seu telefone</label>
              <PhoneInput
                country={'br'}
                value={formData.phone || ''}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                }}
                inputClass={styles.phoneInput}
                buttonClass={styles.phoneButton}
                dropdownClass={styles.phoneDropdown}
                containerClass={styles.phoneContainer}
              />
              <div className={styles.inputBottomText}>
                <span>Vamos te enviar informações por WhatsApp</span>
              </div>
            </div>
          </Card>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="accept-terms"
              checked={!!formData.acceptsSms}
              onChange={(e) => {
                setFormData((prevData) => ({
                  ...prevData,
                  acceptsSms: e.target.checked,
                }));
              }}
            />
            <label htmlFor="accept-terms">
              Aceito que entrem em contato comigo via WhatsApp e/ou SMS neste número.
            </label>
          </div>
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
