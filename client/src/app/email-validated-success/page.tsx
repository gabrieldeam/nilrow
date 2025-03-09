'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './EmailValidatedSuccess.module.css';
import successImage from '../../../public/assets/email-validated-success.png';

const EmailValidatedSuccess = () => {
  return (
    <div className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <Image 
          src={successImage} 
          alt="Email validated successfully" 
          className={styles.image} 
          priority 
        />
        <h1 className={`${styles.title} roboto-black`}>Email Verificado com Sucesso!</h1>
        <p className={`${styles.message} roboto-regular`}>
          Seu endereço de e-mail foi verificado com sucesso. Agora você pode acessar todos os recursos da Nilrow.
        </p>
        <div className={styles.linkContainer}>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default memo(EmailValidatedSuccess);
