import React, { memo } from 'react';
import styles from './LoadingSpinner.module.css'; 

const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.loadingSpinner}>
      <div className={`${styles.spinner} ${styles.spinner1}`}></div>
      <div className={`${styles.spinner} ${styles.spinner2}`}></div>
    </div>
  );
};

export default memo(LoadingSpinner);
