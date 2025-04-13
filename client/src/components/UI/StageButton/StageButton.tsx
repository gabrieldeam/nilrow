import React, { memo, useCallback } from 'react';
import Image from 'next/image'; 
import styles from './StageButton.module.css'; 
import { StageButtonProps } from '../../../types/components/UI/StageButton';

const StageButton: React.FC<StageButtonProps> = ({ 
  text, 
  backgroundColor = '#7B33E5', 
  onClick = () => {}, 
  imageSrc = null,
  type = 'button',
  width = '100%'  
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onClick(e);
  }, [onClick]);

  return (
    <button 
      className={styles.stageButton}
      style={{ backgroundColor, width }}
      onClick={handleClick}
      type={type}
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
