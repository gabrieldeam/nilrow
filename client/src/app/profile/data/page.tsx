'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

import Card from '../../../components/UI/Card/Card';
import MobileHeader from '../../../components/Layout/MobileHeader/MobileHeader';
import SeeData from '../../../components/UI/SeeData/SeeData';
import SubHeader from '../../../components/Layout/SubHeader/SubHeader';

import { getUserProfile } from '../../../services/profileService';

import styles from './data.module.css';

function DataPage() {
  const [profile, setProfile] = useState<any>({});
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }

    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleBack = useCallback(() => {
    router.back(); 
  }, [router]);

  return (
    <div className={styles['data-page']}>
      <Head>
        <title>Dados - Nilrow</title>
        <meta name="description" content="Veja seus dados na Nilrow." />
      </Head>

      {isMobile && (
        <MobileHeader
          title="Dados"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles['data-container']}>
        <SubHeader title="Dados" handleBack={handleBack} />

        <Card
          title="Dados da sua conta"
          rightLink={{ href: '/profile/data/edit', text: 'Alterar' }}
        >
          <div className={styles['see-data-wrapper']}>
            <SeeData title="Nome completo" content={profile.name} />
            <SeeData title="CPF" content={profile.cpf} />
            <SeeData title="Data de nascimento" content={profile.birthDate} />
            <SeeData title="Senha" content="*********" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default memo(DataPage);
