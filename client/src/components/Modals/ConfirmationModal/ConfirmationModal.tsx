'use client';

import React, { useEffect } from 'react';
import StageButton from '../../UI/StageButton/StageButton';

// Import do CSS Module
import styles from './confirmationModal.module.css';

type ConfirmationModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
};

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  message = 'Você tem certeza que deseja continuar?',
}: ConfirmationModalProps) {
  // Bloquear scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles['confirmation-modal-overlay']}>
      <div className={styles['confirmation-modal-container']}>
        <div>
          <h2 className={`${styles['confirmation-modal-title']} roboto-medium`}>
            Confirmação
          </h2>
          <p className={`${styles['confirmation-modal-description']} roboto-regular`}>
            {message}
          </p>
          <div className={styles['confirmation-modal-actions']}>
            <StageButton text="Confirmar" backgroundColor="#DF1414" onClick={onConfirm} />
            <StageButton text="Cancelar" backgroundColor="#212121" onClick={onCancel} />
          </div>
        </div>
      </div>
    </div>
  );
}
