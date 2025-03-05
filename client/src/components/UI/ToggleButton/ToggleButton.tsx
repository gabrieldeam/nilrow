'use client';

import React, { useState, useEffect } from 'react';
import styles from './ToggleButton.module.css';
import { ToggleButtonProps } from '../../../types/components/UI/ToggleButton';

const ToggleButton: React.FC<ToggleButtonProps> = ({ initial = false, onToggle }) => {
  const [toggled, setToggled] = useState(initial);

  useEffect(() => {
    setToggled(initial);
  }, [initial]);

  const handleClick = () => {
    const newState = !toggled;
    setToggled(newState);
    onToggle?.(newState); // Passa o novo estado para o callback
  };

  return (
    <div
      className={`${styles['toggle-button']} ${toggled ? styles.toggled : ''}`}
      onClick={handleClick}
    >
      <div
        className={`${styles['toggle-button-circle']} ${toggled ? styles.toggled : ''}`}
      ></div>
    </div>
  );
};

export default ToggleButton;
