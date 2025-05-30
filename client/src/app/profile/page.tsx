'use client';

import React, { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useBag } from '@/context/BagContext';

import { useAuth } from '@/hooks/useAuth';

import HeaderButton from '@/components/UI/HeaderButton/HeaderButton';
import StepButton from '@/components/UI/StepButton/StepButton';
import Card from '@/components/UI/Card/Card';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SeeData from '@/components/UI/SeeData/SeeData';

import { getUserProfile, getUserNickname, getEmailValidated } from '@/services/profileService';
import { getMyChannel, isChannelActive } from '@/services/channel/channelService';

import ordersIcon from '@/../public/assets/orders.svg';
import notificationsIcon from '@/../public/assets/notifications.svg';
import blockedIcon from '@/../public/assets/blocked.svg';
import likesIcon from '@/../public/assets/likes.svg';
import dataEditIcon from '@/../public/assets/dataedit.svg';
import addressIcon from '@/../public/assets/addressProfile.svg';
import cardIcon from '@/../public/assets/card.svg';
import privacyIcon from '@/../public/assets/privacy.svg';
import userIcon from '@/../public/assets/user.png';

import styles from './profile.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// Definindo a interface para os dados do perfil
interface ProfileData {
  email: string;
  phone?: string;
  // Outras propriedades podem ser adicionadas conforme necessário
}

function Profile() {
  const router = useRouter();
  const { handleLogout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({ email: '' });
  const [nickname, setNickname] = useState('');
  const [emailValidated, setEmailValidated] = useState(false);
  const [channelImageUrl, setChannelImageUrl] = useState('');
  const { clearBag } = useBag(); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }

    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
        const userNickname = await getUserNickname();
        setNickname(userNickname);
        const emailValid = await getEmailValidated();
        setEmailValidated(emailValid);
      } catch {
        console.error('Erro ao buscar dados do perfil.');
      }
    };

    const fetchChannelData = async () => {
      try {
        const channel = await getMyChannel();
        setChannelImageUrl(channel.imageUrl ?? '');
      } catch {
        console.error('Erro ao buscar dados do canal.');
        setChannelImageUrl('');
      }
    };

    fetchProfileData();
    fetchChannelData();
  }, []);

  const handleChannelClick = async () => {
    try {
      const channel = await getMyChannel();
      const activeStatus = await isChannelActive(channel.id);

      if (activeStatus) {
        router.push(`/${nickname}`);
      } else {
        router.push('/channel');
      }
    } catch {
      router.push('/profile/add');
    }
  };

  const formattedNickname = `${nickname}`;
  const formattedPhone = profile.phone
    ? profile.phone.startsWith('55')
      ? profile.phone.substring(2)
      : profile.phone
    : '';

  return (
    <div className={styles.profilePage}>
      {isMobile && (
        <MobileHeader title="Meu perfil" buttons={{ bag: true }} />
      )}

      <div className={styles.profileContainer}>
        <div className={styles.profileContent}>
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              <h1 className={`${styles['profile-title']} roboto-medium`}>
                Meu perfil
              </h1>
              <div className={styles.profileButtons}>
                <HeaderButton icon={ordersIcon} link="/profile/orders" />
                <HeaderButton icon={notificationsIcon} link="/profile/notifications" />
                <HeaderButton icon={blockedIcon} link="/profile/blocked" />
                <HeaderButton icon={likesIcon} link="/profile/likes" />
              </div>
            </div>

            <div className={`${styles.logoutLink} ${styles.desktopOnly}`}>
              <button className={styles.logoutButton} onClick={() => {clearBag(); handleLogout();}}>
                Sair
              </button>
            </div>
          </div>

          <div className={styles.profileSteps}>
            <div className={styles.profileStepCardWrapper}>
              <StepButton
                icon={dataEditIcon}
                title="Dados pessoais"
                paragraph="Informações do seu documento de identidade e sua atividade econômica."
                onClick={() => router.push('/profile/data')}
              />
              <Card
                title="Dados da sua conta"
                rightLink={{ href: '/profile/edit', text: 'Alterar' }}
              >
                <div className={styles.seeDataWrapper}>
                  <SeeData
                    title="E-mail"
                    content={profile.email}
                    showIcon={emailValidated}
                  />
                  <SeeData title="Telefone" content={formattedPhone} />
                  <SeeData title="Nome de usuário" content={formattedNickname} />
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className={styles.additionalSteps}>
          <StepButton
            customIcon={
              channelImageUrl ? `${apiUrl}${channelImageUrl}` : userIcon
            }
            title="Canal"
            paragraph="Perfil público da sua conta, onde todos os usuários poderão te achar."
            onClick={handleChannelClick}
          />
          <StepButton
            icon={addressIcon}
            title="Endereços"
            paragraph="Endereços de entrega salvos na sua conta"
            onClick={() => router.push('/profile/address')}
          />
          <StepButton
            icon={cardIcon}
            title="Cartões"
            paragraph="Todos cartões usados para comprar salvos na sua conta."
            onClick={() => router.push('/profile/cards')}
          />
          <StepButton
            icon={privacyIcon}
            title="Privacidade"
            paragraph="Preferências e controle do uso dos seus dados."
            onClick={() => router.push('/profile/privacy')}
          />
        </div>

        <div className={`${styles.logoutLink} ${styles.mobileOnly}`}>
          <button className={styles.logoutButton} onClick={() => {clearBag(); handleLogout();}}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(Profile);
