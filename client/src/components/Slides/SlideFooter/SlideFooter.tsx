'use client';

import React, { useState, useEffect, memo } from 'react';
import styles from './SlideFooter.module.css';

interface SlideFooterProps {
  initialOpenState?: boolean;
}

const SlideFooter: React.FC<SlideFooterProps> = ({ initialOpenState = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpenState);

  useEffect(() => {
    setIsOpen(initialOpenState);
  }, [initialOpenState]);

  const toggleFooter = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.slidefooterContainer} ${isOpen ? styles.open : styles.closed}`}>
      <button className={styles.slidefooterToggleButton} onClick={toggleFooter}>
        {isOpen ? 'Menos informações' : 'Mais informações'}
      </button>
      {isOpen && (
        <div className={styles.slidefooterContent}>
          <p>Aqui vão as informações detalhadas do rodapé...</p>
        </div>
      )}
    </div>
  );
};

export default memo(SlideFooter);
