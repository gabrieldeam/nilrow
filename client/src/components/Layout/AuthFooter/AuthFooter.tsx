'use client';

import React, { useState, useEffect, memo } from 'react';
import styles from './AuthFooter.module.css';

interface AuthFooterProps {
  initialOpenState?: boolean;
}

const AuthFooter: React.FC<AuthFooterProps> = ({ initialOpenState = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpenState);

  useEffect(() => {
    setIsOpen(initialOpenState);
  }, [initialOpenState]);

  const toggleFooter = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.authfooterContainer} ${isOpen ? styles.open : styles.closed}`}>
      <button className={`${styles.authfooterToggleButton} roboto-medium`} onClick={toggleFooter}>
        {isOpen ? 'Menos informações' : 'Mais informações'}
      </button>
      {isOpen && (
        <div className={styles.authfooterContent}>
          <p>Aqui vão as informações detalhadas do rodapé...</p>
        </div>
      )}
    </div>
  );
};

export default memo(AuthFooter);
