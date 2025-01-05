import React, { memo, useCallback } from 'react';
import styles from './LoginButton.module.css';
import { LoginButtonProps } from '../../../types/components/UI/LoginButton';

const LoginButton: React.FC<LoginButtonProps> = ({ text, link = '#', onClick }) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        e.preventDefault();
        onClick(e);
      }
    },
    [onClick]
  );

  return (
    <a href={link} className={styles['login-button']} onClick={handleClick}>
      {text}
    </a>
  );
};

export default memo(LoginButton);
