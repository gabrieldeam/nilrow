import React, { useState, memo, useCallback } from 'react';
import Image from 'next/image';
import styles from './CustomInput.module.css';
import eyeIcon from '../../../../public/assets/olho.svg';
import eyeOffIcon from '../../../../public/assets/olhos-cruzado.svg';
import { CustomInputProps } from '../../../types/components/UI/CustomInput'; // Importando as interfaces

const CustomInput: React.FC<CustomInputProps> = ({
  title,
  placeholder = '',
  bottomLeftText = '',
  bottomRightLink = null,
  onChange,
  value = '',
  type = 'text',
  name = '',
  isValid,
  prefix,
  readOnly = false,
  checkbox = null,
  isTextarea = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prevState) => !prevState);
  }, []);

  return (
    <div className={styles.customInputContainer}>
      {title && <label className={styles.inputTitle}>{title}</label>}
      <div className={`${styles.inputWrapper} ${isTextarea ? styles.textareaWrapper : ''}`}>
        {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
        {isTextarea ? (
          <textarea
            className={`${styles.customInput} ${styles.customTextarea} ${
              isValid === true ? styles.valid : isValid === false ? styles.invalid : ''
            } ${readOnly ? styles.readOnly : ''}`}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            name={name}
            style={{ paddingLeft: prefix ? '106px' : '14px' }}
            readOnly={readOnly}
          />
        ) : (
          <input
            type={isPasswordVisible && type === 'password' ? 'text' : type}
            className={`${styles.customInput} ${
              isValid === true ? styles.valid : isValid === false ? styles.invalid : ''
            } ${readOnly ? styles.readOnly : ''}`}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            name={name}
            style={{ paddingLeft: prefix ? '106px' : '14px' }}
            readOnly={readOnly}
          />
        )}
        {type === 'password' && !isTextarea && (
          <Image
            src={isPasswordVisible ? eyeIcon : eyeOffIcon}
            alt="Toggle visibility"
            className={styles.visibilityIcon}
            onClick={togglePasswordVisibility}
          />
        )}
        {checkbox && (
          <div className={`${styles.customInputCheckboxContainer} roboto-light`}>
            <input
              type="checkbox"
              checked={checkbox.checked}
              onChange={checkbox.onChange}
            />
            <label>{checkbox.label}</label>
          </div>
        )}
      </div>
      <div className={styles.inputBottomText}>
        {bottomLeftText && <span className={styles.bottomLeft}>{bottomLeftText}</span>}
        {bottomRightLink && (
          <a href={bottomRightLink.href} className={styles.bottomRight}>
            {bottomRightLink.text}
          </a>
        )}
      </div>
    </div>
  );
};

export default memo(CustomInput);
