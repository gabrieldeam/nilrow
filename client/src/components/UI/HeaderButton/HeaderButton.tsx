import React, { useCallback, forwardRef, memo } from 'react';
import styles from './HeaderButton.module.css';
import { HeaderButtonProps } from '../../../types/components/UI/HeaderButton';

const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ text, icon, link, newTab = false, isActive = false, onClick }, ref) => {
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
        className={`${styles['custom-button']} roboto-regular ${isActive ? styles.active : ''}`}
        onClick={handleClick}
        ref={ref}
      >
        {icon && (
          <img
            src={icon}
            alt="icon"
            className={`${styles['button-icon']} ${text ? styles['with-text'] : ''}`}
            loading="lazy"
          />
        )}
        <span>{text}</span>
      </button>
    );
  }
);

HeaderButton.displayName = 'HeaderButton'; // Necessário para forwardRef
export default memo(HeaderButton);
