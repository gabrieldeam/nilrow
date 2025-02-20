// HeaderButton.tsx
import React, { useCallback, forwardRef, memo } from 'react';
import Image from 'next/image';
import styles from './HeaderButton.module.css';
import { HeaderButtonProps } from '../../../types/components/UI/HeaderButton';

const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ text, icon, link, newTab = false, isActive = false, onClick, className }, ref) => {
    const handleClick = useCallback(() => {
      if (onClick) {
        onClick();
      } else if (link) {
        const isExternal = link.startsWith('http://') || link.startsWith('https://');
        if (isExternal) {
          newTab ? window.open(link, '_blank') : (window.location.href = link);
        } else {
          newTab ? window.open(link, '_blank') : (window.location.href = link);
        }
      }
    }, [link, newTab, onClick]);

    return (
      <button
        className={`${styles['custom-button']} roboto-regular ${isActive ? styles.active : ''} ${className || ''}`}
        onClick={handleClick}
        ref={ref}
      >
        {icon && (
          <Image
            src={icon}
            alt="icon"
            className={`${styles['button-icon']} ${text ? styles['with-text'] : ''}`}
            width={20}
            height={20}
            loading="lazy"
          />
        )}
        <span>{text}</span>
      </button>
    );
  }
);

HeaderButton.displayName = 'HeaderButton';
export default memo(HeaderButton);
