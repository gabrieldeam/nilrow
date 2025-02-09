'use client';

import React, { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../hooks/useAuth'; 

import HeaderButton from '../../components/UI/HeaderButton/HeaderButton';
import StepButton from '../../components/UI/StepButton/StepButton';
import Card from '../../components/UI/Card/Card';
import MobileHeader from '../../components/Layout/MobileHeader/MobileHeader';
import SeeData from '../../components/UI/SeeData/SeeData';

import { getUserProfile, getUserNickname, getEmailValidated } from '../../services/profileService';
import { getMyChannel, isChannelActive } from '../../services/channel/channelService';

import ordersIcon from '../../../public/assets/orders.svg';
import notificationsIcon from '../../../public/assets/notifications.svg';
import blockedIcon from '../../../public/assets/blocked.svg';
import likesIcon from '../../../public/assets/likes.svg';
import dataEditIcon from '../../../public/assets/dataedit.svg';
import addressIcon from '../../../public/assets/addressProfile.svg';
import cardIcon from '../../../public/assets/card.svg';
import privacyIcon from '../../../public/assets/privacy.svg';
import userIcon from '../../../public/assets/user.png';

import styles from './profile.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

function Profile() {
  const router = useRouter();
  const { handleLogout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [nickname, setNickname] = useState('');
  const [emailValidated, setEmailValidated] = useState(false);
  const [channelImageUrl, setChannelImageUrl] = useState('');

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
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
      }
    };

    const fetchChannelData = async () => {
      try {
        const channel = await getMyChannel();
        setChannelImageUrl(channel.imageUrl ?? '');
      } catch (error) {
        console.error('Erro ao buscar dados do canal:', error);
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
        router.push('channel');
      }
    } catch (error) {
      router.push('/profile/add');
    }
  };

  const formattedNickname = `${nickname}`;
  const formattedPhone = profile.phone?.startsWith('55')
    ? profile.phone.substring(2)
    : profile.phone;

  return (
    <div className={styles['profile-page']}>
      <Head>
        <title>Meu perfil - Nilrow</title>
        <meta name="description" content="Veja seu perfil na Nilrow." />
      </Head>

      {isMobile && (
        <MobileHeader
          title="Meu perfil"
          buttons={{ bag: true }}
        />
      )}

      <div className={styles['profile-container']}>
        <div className={styles['profile-content']}>
          <div className={styles['profile-header']}>
            <div className={styles['profile-info']}>
              <h1 className={`${styles['profile-title']} roboto-medium`}>
                Meu perfil
              </h1>
              <div className={styles['profile-buttons']}>
                <HeaderButton icon={ordersIcon} link="/orders" />
                <HeaderButton icon={notificationsIcon} link="/notifications" />
                <HeaderButton icon={blockedIcon} link="/blocked" />
                <HeaderButton icon={likesIcon} link="/likes" />
              </div>
            </div>

            <div className={`${styles['logout-link']} ${styles['desktop-only']}`}>
              <button
                className={styles['logout-button']}
                onClick={handleLogout}
              >
                Sair
              </button>
            </div>
          </div>

            <div className={styles['profile-steps']}>
                <div className={styles['profile-step-card-wrapper']}>
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
                        <div className={styles['see-data-wrapper']}> 
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

        <div className={styles['additional-steps']}>
          <StepButton
            customIcon={channelImageUrl ? `${apiUrl}${channelImageUrl}` : userIcon}
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

        <div className={`${styles['logout-link']} ${styles['mobile-only']}`}>
          <button
            className={styles['logout-button']}
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(Profile);
