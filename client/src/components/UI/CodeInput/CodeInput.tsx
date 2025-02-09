import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import styles from './CodeInput.module.css';
import { CodeInputProps } from '../../../types/components/UI/CodeInput';

const CodeInput: React.FC<CodeInputProps> = ({ length, onChange }) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    onChange(values.join(''));
  }, [values, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newValues = [...values];
      newValues[index] = e.target.value.slice(-1);
      setValues(newValues);
      if (e.target.value && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    },
    [values, length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const paste = e.clipboardData.getData('text').slice(0, length).split('');
      const newValues = [...values];
      paste.forEach((char, i) => {
        newValues[i] = char;
      });
      setValues(newValues);
      const nextIndex = paste.length < length ? paste.length : length - 1;
      inputsRef.current[nextIndex]?.focus();
    },
    [values, length]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    },
    [values]
  );

  return (
    <div className={styles.codeInputContainer}>
      {values.map((value, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(e, index)}
          onPaste={handlePaste}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => {
            inputsRef.current[index] = el; 
          }}
          className={styles.codeInput}
        />
      ))}
    </div>
  );
};

export default memo(CodeInput);
