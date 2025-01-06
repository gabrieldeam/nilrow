'use client';

import React, { useEffect, useState } from 'react';
import Categories from '../../../app/categories/page';
import styles from './ModalCategories.module.css';

const ModalCategories: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.content} ${isClosing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          X
        </button>
        <Categories onClose={handleClose} />
      </div>
    </div>
  );
};

export default ModalCategories;
