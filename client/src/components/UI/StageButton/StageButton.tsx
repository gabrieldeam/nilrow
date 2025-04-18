// components/UI/StageButton/StageButton.tsx
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
  disabled = false,
  width = '100%',
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // chama tanto sync quanto async
    const result = onClick(e);
    if (result instanceof Promise) {
      result.catch((err) => console.error(err));
    }
  }, [onClick]);

  return (
    <button
      className={styles.stageButton}
      style={{ backgroundColor, width }}
      onClick={handleClick}
      type={type}
      disabled={disabled}
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
