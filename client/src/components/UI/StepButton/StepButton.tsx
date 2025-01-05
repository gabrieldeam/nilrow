import React, { memo, useCallback } from 'react';
import Image from 'next/image';
import styles from './StepButton.module.css';
import { StepButtonProps } from '../../../types/components/UI/StepButton';

import verifiedIcon from '../../../../public/assets/verificacao.svg';
import arrowIcon from '../../../../public/assets/setadireito.svg';

const StepButton: React.FC<StepButtonProps> = ({
  icon,
  customIcon,
  title,
  paragraph,
  isVerified = false,
  onClick,
  className = '',
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick(e);
    },
    [onClick]
  );

  return (
    <button
      className={`${styles.stepButton} ${className}`}
      onClick={handleClick}
    >
      <div className={styles.stepButtonLeft}>
        <div className={styles.stepButtonIconCircle}>
          {customIcon ? (
            <Image
              src={customIcon}
              alt="Custom Icon"
              className={styles.stepButtonCustomIcon}
              width={51}
              height={51}
            />
          ) : (
            <Image
              src={icon || ''}
              alt="Step Icon"
              className={styles.stepButtonIcon}
              width={24}
              height={24}
            />
          )}
        </div>
        <div className={styles.stepButtonText}>
          <h3>{title}</h3>
          <p>{paragraph}</p>
        </div>
      </div>
      <div className={styles.stepButtonRight}>
        {isVerified && (
          <Image
            src={verifiedIcon}
            alt="Verified Icon"
            className={styles.stepButtonVerified}
            width={20}
            height={20}
          />
        )}
        <Image
          src={arrowIcon}
          alt="Arrow Icon"
          className={styles.stepButtonArrow}
          width={20}
          height={20}
        />
      </div>
    </button>
  );
};

export default memo(StepButton);
