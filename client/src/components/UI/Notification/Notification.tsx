import React, { useEffect, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import styles from './Notification.module.css'; // Importa os estilos
import { NotificationProps } from '../../../types/components/UI/Notification';

import avisoIcon from '../../../../public/assets/aviso.svg'; // Caminho ajustado

const Notification: React.FC<NotificationProps> = ({ message, onClose, backgroundColor = '#DF1414' }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = useCallback(() => {
    setVisible(false);
    onClose();
  }, [onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.notification} style={{ backgroundColor }}>
      <div className={styles.notificationContent}>
        <div className={styles.notificationIcon}>
          <Image src={avisoIcon} alt="Aviso" width={24} height={24} />
        </div>
        <span>{message}</span>
        <button className={styles.notificationClose} onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default memo(Notification);
