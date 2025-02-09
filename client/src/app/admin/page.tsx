'use client';

import React, { useState, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/UI/LoadingSpinner/LoadingSpinner';
import StepButton from '../../components/UI/StepButton/StepButton';

import iconStep1 from '../../../public/assets/contato.svg';
import iconStep2 from '../../../public/assets/user.svg';

import styles from './admin.module.css';

function Administration() {
  const [loading] = useState(false);
  const router = useRouter();

  return (
    <div className={styles['administration-page']}>
      <Head>
        <title>Administration</title>
        <meta
          name="description"
          content="Faça login na Nilrow usando seu email ou nome de usuário."
        />
      </Head>

      {loading && <LoadingSpinner />}

      <div className={styles['administration-container']}>
        <div className={styles['administration-list']}>
          <StepButton
            icon={iconStep1}
            title="Usuários"
            paragraph="Lista de usuários cadastrados"
            onClick={() => router.push('/admin/users')}
          />

          <StepButton
            icon={iconStep2}
            title="Categorias"
            paragraph="Crie e veja as categorias e subcategorias"
            onClick={() => router.push('/admin/category')} 
          />
        </div>
      </div>
    </div>
  );
}

export default memo(Administration);
