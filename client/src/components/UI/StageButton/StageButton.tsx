import React, { memo, useCallback } from 'react';
import Image from 'next/image'; // Para otimização de imagens
import styles from './StageButton.module.css'; // Importa os estilos
import { StageButtonProps } from '../../../types/components/UI/StageButton'; // Importa as interfaces

const StageButton: React.FC<StageButtonProps> = ({ 
  text, 
  backgroundColor = '#7B33E5', 
  onClick = () => {}, 
  imageSrc = null 
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onClick(e);
  }, [onClick]);

  return (
    <button 
      className={styles.stageButton}
      style={{ backgroundColor }}
      onClick={handleClick}
    >
      {imageSrc && (
        <Image 
          src={imageSrc} 
          alt="" 
          className={styles.stageButtonIcon} 
          width={16} 
          height={16} 
          loading="lazy" 
        />
      )}
      {text}
    </button>
  );
};

export default memo(StageButton);
