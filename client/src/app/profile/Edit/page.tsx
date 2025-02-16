"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import CustomInput from '@/components/UI/CustomInput/CustomInput';
import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import Notification from '@/components/UI/Notification/Notification';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';

import { useNotification } from '@/hooks/useNotification';

import {
  getUserProfile,
  updateUserProfile,
  getUserNickname,
  updateUserNickname
} from '@/services/profileService';

import { FormDataProps, ProfileUpdateData } from '@/types/services/profile';

import styles from './editProfile.module.css';

const validateNickname = (nickname: string) => {
  const regex = /^[a-z][a-z0-9._]{2,28}[a-z0-9]$/;
  const hasNoConsecutiveSpecialChars = !/([._])\1/.test(nickname);
  return regex.test(nickname) && hasNoConsecutiveSpecialChars;
};

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePhone = (phone: string) => {
  const regex = /^\+?\d{10,15}$/;
  return regex.test(phone);
};

function EditProfile() {
  const router = useRouter();
  const { setMessage } = useNotification();

  const [formData, setFormData] = useState<FormDataProps>({
    email: '',
    phone: '',
    nickname: '',
  });

  const [originalData, setOriginalData] = useState<FormDataProps>({
    email: '',
    phone: '',
    nickname: '',
  });

  const [nicknameValid, setNicknameValid] = useState<boolean | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userProfile = await getUserProfile();
        const userNickname = await getUserNickname();

        // Se o nickname veio com '@' remove o caractere
        const nicknameNoAt = userNickname.replace('@', '');

        setFormData({
          email: userProfile.email,
          phone: userProfile.phone,
          nickname: nicknameNoAt,
        });

        setOriginalData({
          email: userProfile.email,
          phone: userProfile.phone,
          nickname: nicknameNoAt,
        });

        setNicknameValid(validateNickname(nicknameNoAt));
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const newValue = name === 'nickname' ? value.toLowerCase() : value;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      if (name === 'nickname') {
        setNicknameValid(validateNickname(newValue));
      }
    },
    []
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({
        ...prev,
        phone: value,
      }));
    },
    []
  );

  useEffect(() => {
    const { email, phone, nickname } = formData;
    const allFieldsFilled = email !== '' && phone !== '' && nickname !== '';
    setIsFormValid(allFieldsFilled && !!nicknameValid);
  }, [formData, nicknameValid]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!isFormValid) {
        setError('Por favor, preencha todos os campos.');
        setShowNotification(true);
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Por favor, insira um email válido.');
        setShowNotification(true);
        return;
      }
      if (!validatePhone(formData.phone)) {
        setError('Por favor, insira um telefone válido.');
        setShowNotification(true);
        return;
      }
      if (!nicknameValid) {
        setError('Por favor, insira um nome de usuário válido.');
        setShowNotification(true);
        return;
      }

      // Monta objeto parcial de atualização
      const updatedProfileData: ProfileUpdateData = {};
      if (formData.email !== originalData.email) {
        updatedProfileData.email = formData.email;
      }
      if (formData.phone !== originalData.phone) {
        updatedProfileData.phone = formData.phone;
      }
      
      // Atualiza o nickname se ele foi alterado
      const updatedNickname =
        formData.nickname !== originalData.nickname
          ? formData.nickname
          : undefined;

      try {
        // Se houver alguma alteração em email ou telefone, atualiza o perfil
        if (Object.keys(updatedProfileData).length > 0) {
          await updateUserProfile(updatedProfileData);
        }
        // Se o nickname foi alterado, atualiza-o
        if (updatedNickname) {
          await updateUserNickname(updatedNickname);
        }

        setMessage('Dados atualizados com sucesso!', 'success');
        router.push('/profile');
      } catch (error: any) {
        const errorMessage =
          error?.response?.data || 'Erro ao atualizar dados. Tente novamente.';
        console.error('Erro ao atualizar dados:', errorMessage);

        setError(errorMessage);
        setShowNotification(true);
      }
    },
    [
      isFormValid,
      formData,
      nicknameValid,
      originalData,
      setMessage,
      router
    ]
  );

  return (
    <div className={styles['edit-profile-page']}>
      <Head>
        <title>Editar Perfil - Nilrow</title>
        <meta name="description" content="Edite seu perfil na Nilrow." />
      </Head>

      {showNotification && (
        <Notification
          message={error}
          onClose={() => setShowNotification(false)}
        />
      )}

      {isMobile && (
        <MobileHeader
          title="Editar dados"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles['edit-profile-container']}>
        <SubHeader title="Editar dados" handleBack={handleBack} />
        <form onSubmit={handleSubmit}>
          <Card title="Alterar">
            <CustomInput
              title="E-mail"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              bottomLeftText="Certifique-se de que você tenha acesso a ele"
            />

            <div className={styles['custom-input-container-phone']}>
              <label className={styles['input-title-phone']}>Telefone</label>
              <PhoneInput
                country={'br'}
                value={formData.phone}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                }}
                inputClass={styles['phone-input']}
                buttonClass={styles['phone-input-button']}
                dropdownClass={styles['phone-input-dropdown']}
                containerClass={styles['phone-input-container']}
              />
              <div className={styles['input-bottom-text']}>
                <span className={styles['bottom-left-phone']}>
                  Vamos te enviar informações por WhatsApp
                </span>
              </div>
            </div>

            <CustomInput
              title="Nome de usuário"
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              isValid={nicknameValid ?? undefined}
              bottomLeftText="Este será seu identificador único na plataforma"
            />
          </Card>

          <div className={styles['confirmationButton-space']}>
            <StageButton
              text="Salvar"
              backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
