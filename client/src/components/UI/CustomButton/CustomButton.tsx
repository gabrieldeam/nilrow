
import React from 'react';
import { CustomButtonProps } from '@/types/components/UI/CustomButton';
import styles from './CustomButton.module.css';

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  backgroundColor = '#007BFF',
  onClick,
}) => {
  return (
    <button
      className={styles.customButtonPro}
      style={{ backgroundColor }}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default CustomButton;
