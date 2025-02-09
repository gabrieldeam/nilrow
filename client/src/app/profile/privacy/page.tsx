'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

import MobileHeader from '../../../components/Layout/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Layout/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import ConfirmationModal from '../../../components/Modals/ConfirmationModal/ConfirmationModal';

import { getAcceptsSms, updateAcceptsSms, deleteUser } from '../../../services/privacyService';

import styles from './privacy.module.css';

function PrivacyPage() {
  const router = useRouter();

  const [acceptsSms, setAcceptsSms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const fetchData = async () => {
      try {
        const data = await getAcceptsSms();
        setAcceptsSms(data); 
      } catch (error) {
        console.error('Error fetching acceptsSms:', error);
      }
    };
    fetchData();
  }, []);

  const handleToggle = async (newState: boolean) => {
    try {
      await updateAcceptsSms(newState);
      setAcceptsSms(newState);
    } catch (error) {
      console.error('Error updating acceptsSms:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={styles['privacy-page']}>
      <Head>
        <title>Privacidade</title>
        <meta
          name="description"
          content="Gerencie suas preferências de privacidade na Nilrow."
        />
      </Head>

      {isMobile && (
        <MobileHeader
          title="Privacidade"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles['privacy-container']}>
        <div className={styles['privacy-header']}>
          <SubHeader title="Privacidade" handleBack={handleBack} />

          <div className={`${styles['delete-link']} ${styles['desktop-only']}`}>
            <button className={styles['delete-button']} onClick={openModal}>
              Deletar conta
            </button>
          </div>
        </div>

        <Card title="Gerenciar permissões de privacidade">
          <div className={styles['privacy-see-data-wrapper']}>
            <SeeData
              title="Aceito que entrem em contato comigo via WhatsApp e/ou SMS neste número."
              content="Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta."
              stackContent={true}
              showToggleButton={true}
              onToggle={handleToggle}
              toggled={acceptsSms}
            />
          </div>
        </Card>

        <div className={`${styles['delete-link']} ${styles['mobile-only']}`}>
          <button className={styles['delete-button']} onClick={openModal}>
            Deletar conta
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleDeleteAccount}
        onCancel={closeModal}
        message="Você tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita."
      />
    </div>
  );
}

export default memo(PrivacyPage);
