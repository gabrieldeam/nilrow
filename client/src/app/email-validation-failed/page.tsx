'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './EmailValidationFailed.module.css';
import failedImage from '@/public/assets/email-validation-failed.png';

const EmailValidationFailed = () => {
  return (
    <div className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <Image 
          src={failedImage} 
          alt="Email validation failed" 
          className={styles.image} 
          priority 
        />
        <h1 className={`${styles.title} roboto-black`}>Falha na Verificação do E-mail</h1>
        <p className={`${styles.message} roboto-regular`}>
          Ocorreu um problema ao verificar seu endereço de e-mail. Por favor, tente novamente ou entre em contato com o suporte.
        </p>
        <div className={styles.linkContainer}>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default memo(EmailValidationFailed);
