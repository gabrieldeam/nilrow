'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AuthHeader.module.css';
import HeaderButton from '../../UI/HeaderButton/HeaderButton';

import logo from '../../../../public/assets/nilrow.svg';
import infoIcon from '../../../../public/assets/informacoes.svg';

const AuthHeader: React.FC = () => {
  return (
    <header className={styles.authheader}>
      <div className={styles.authheaderLeft}>
        <Link href="/">
          <Image src={logo} alt="Logo" className={styles.authlogo} priority />
        </Link>
      </div>
      <div className={styles.authheaderRight}>
        <HeaderButton
          text="Feedback e ajuda"
          icon={infoIcon}
          link="http://google.com"
          newTab={true}
        />
      </div>
    </header>
  );
};

export default memo(AuthHeader);
