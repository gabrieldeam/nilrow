import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PrivacyNotice.module.css';
import privatIcon from '../../../../public/assets/privat.svg';

const PrivacyNotice: React.FC = () => {
  return (
    <div className={styles.privacyNotice}>
      <Image
        src={privatIcon}
        alt="Privacy Icon"
        className={styles.privacyIcon}
        width={26}
        height={26}
        loading="lazy"
      />
      <span>
        Ao continuar, aceito os{' '}
        <Link href="/termos-e-condicoes" className={styles.privacyLink}>
          Termos e condições
        </Link>{' '}
        e autorizo o uso dos meus dados de acordo com a{' '}
        <Link href="/politica-de-privacidade" className={styles.privacyLink}>
          Política de privacidade
        </Link>.
      </span>
    </div>
  );
};

export default memo(PrivacyNotice);
