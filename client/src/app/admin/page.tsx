'use client';

import React, { useState, memo } from 'react';
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
            title="Categorias e Subcatagorias"
            paragraph="Crie e veja as categorias e subcategorias"
            onClick={() => router.push('/admin/category')} 
          />
          </div>
          <div className={styles['administration-list']}>
          <StepButton
            icon={iconStep2}
            title="Marcas"
            paragraph="Crie e veja as Marcas"
            onClick={() => router.push('/admin/brand')} 
          />
          <StepButton
            icon={iconStep2}
            title="Tamplates"
            paragraph="Crie e veja os Tamplates de Produtos"
            onClick={() => router.push('/admin/template')} 
          />
        </div>
      </div>
    </div>
  );
}

export default memo(Administration);
