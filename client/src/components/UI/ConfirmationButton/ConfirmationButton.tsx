import React, { useCallback, memo } from 'react';
import Image from 'next/image'; // Para otimizar imagens no Next.js
import styles from './ConfirmationButton.module.css'; // Importa os estilos
import { ConfirmationButtonProps } from '../../../types/components/UI/ConfirmationButton'; // Importa as interfaces

const ConfirmationButton: React.FC<ConfirmationButtonProps> = ({
  text,
  backgroundColor,
  icon = null,
  type = 'button',
  onClick = () => {},
  disabled = false,
}) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick(event);
    },
    [onClick]
  );

  return (
    <button
      className={`${styles.confirmationButton} roboto-black`}
      style={{ backgroundColor: disabled ? '#212121' : backgroundColor }}
      type={type}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && (
        <Image
          src={icon}
          alt="icon"
          className={`${styles.confirmationButtonIcon} ${text ? styles.confirmationWithText : ''}`}
          width={20}
          height={20}
          loading="lazy"
        />
      )}
      <span>{text}</span>
    </button>
  );
};

export default memo(ConfirmationButton);
