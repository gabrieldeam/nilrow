'use client';

import React, { useCallback } from 'react';
import styles from './classificationSelect.module.css';
import { ClassificationSelectProps } from '@/types/components/UI/ClassificationSelect';

const ClassificationSelect: React.FC<ClassificationSelectProps> = ({
  classifications,
  selectedClassification,
  onChange,
}) => {
  // Lógica do checkbox
  const handleCheckboxChange = useCallback(
    (name: string) => {
      if (selectedClassification === name) {
        onChange('');
      } else {
        onChange(name);
      }
    },
    [selectedClassification, onChange]
  );

  return (
    <div className={styles['classification-select-container']}>
      {classifications.map((classification, index) => (
        <div key={index} className={styles['classification-item']}>
          <span>{classification.value}</span>
          <input
            type="checkbox"
            checked={selectedClassification === classification.name}
            onChange={() => handleCheckboxChange(classification.name)}
          />
        </div>
      ))}
    </div>
  );
};

export default ClassificationSelect;
