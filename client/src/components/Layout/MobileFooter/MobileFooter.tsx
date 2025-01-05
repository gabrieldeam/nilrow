'use client';

import React, { useCallback, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './MobileFooter.module.css';

import homeIcon from '../../../../public/assets/home.svg';
import searchIcon from '../../../../public/assets/search.svg';
import createIcon from '../../../../public/assets/create.svg';
import chatIcon from '../../../../public/assets/chat.svg';
import profileIcon from '../../../../public/assets/profile.svg';
import ProtectedLink from '../../Helpers/ProtectedLink/ProtectedLink';

const MobileFooter: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const getIconClass = useCallback(
    (path: string) => (pathname === path ? `${styles.footerIcon} ${styles.active}` : styles.footerIcon),
    [pathname]
  );

  const handleHomeClick = () => {
    if (pathname === '/') {
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <footer className={styles.mobileFooter}>
      <div onClick={handleHomeClick} className={getIconClass('/')}>
        <Image src={homeIcon} alt="Home" />
      </div>
      <div onClick={() => router.push('/search')} className={getIconClass('/search')}>
        <Image src={searchIcon} alt="Search" />
      </div>
      <ProtectedLink to="/create">
        <div className={getIconClass('/create')}>
          <Image src={createIcon} alt="Create" />
        </div>
      </ProtectedLink>
      <ProtectedLink to="/chat">
        <div className={getIconClass('/chat')}>
          <Image src={chatIcon} alt="Chat" />
        </div>
      </ProtectedLink>
      <ProtectedLink to="/profile">
        <div className={getIconClass('/profile')}>
          <Image src={profileIcon} alt="Profile" />
        </div>
      </ProtectedLink>
    </footer>
  );
};

export default memo(MobileFooter);
