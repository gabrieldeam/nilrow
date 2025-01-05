'use client';

import React, { memo } from 'react';
import styles from './SeeData.module.css';
import ToggleButton from '../ToggleButton/ToggleButton';
import verifiedIcon from '../../../../public/assets/verificacao.svg';
import { SeeDataProps } from '../../../types/components/UI/SeeData';

const SeeData: React.FC<SeeDataProps> = ({
  title,
  content,
  subContent,
  link,
  linkText,
  onClick,
  stackContent = false,
  showToggleButton = false,
  onToggle,
  toggled,
  showIcon = false,
  badgeText,
  badgeBackgroundColor,
}) => {
  return (
    <div
      className={`${styles['see-data-container']} ${stackContent ? styles['stack-content'] : ''}`}
    >
      <div className={styles['see-data-main']}>
        <div className={styles['see-data-title']}>{title}</div>
        {showIcon && (
          <img
            src={verifiedIcon}
            alt="Verified"
            className={styles['see-data-verified-icon']}
          />
        )}
        <div className={`${styles['see-data-content']} ${styles['ellipsis']}`}>
          {content}
        </div>
        {subContent && <div className={styles['see-data-sub-content']}>{subContent}</div>}
      </div>
      <div className={styles['see-data-actions']}>
        {badgeText && (
          <div
            className={styles['see-data-badge']}
            style={{ backgroundColor: badgeBackgroundColor }}
          >
            {badgeText}
          </div>
        )}
        {link && linkText && !onClick && (
          <a href={link} className={styles['see-data-link']}>
            {linkText}
          </a>
        )}
        {onClick && linkText && (
          <button className={styles['see-data-button']} onClick={onClick}>
            {linkText}
          </button>
        )}
        {showToggleButton && <ToggleButton onToggle={onToggle || (() => {})} initial={toggled} />}
      </div>
    </div>
  );
};

export default memo(SeeData);
