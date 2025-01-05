'use client';

import React, { useCallback, memo } from 'react';
import Select from 'react-select';
import { DateInputProps } from '../../../types/components/UI/DateInput';
import styles from './DateInput.module.css';

const DateInput: React.FC<DateInputProps> = ({ title, onChange, value, name, bottomLeftText = '' }) => {
  const options = {
    month: [...Array(12).keys()].map((i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') })),
    day: [...Array(31).keys()].map((i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') })),
    year: [...Array(100).keys()].map((i) => {
      const year = 2024 - i;
      return { value: String(year), label: String(year) };
    }),
  };

  const handleMonthChange = useCallback(
    (selectedOption: any) => {
      const dateParts = value.split('-');
      const newDate = `${dateParts[0] || '2024'}-${selectedOption.value}-${dateParts[2] || '01'}`;
      onChange({ target: { name, value: newDate } });
    },
    [value, name, onChange]
  );

  const handleDayChange = useCallback(
    (selectedOption: any) => {
      const dateParts = value.split('-');
      const newDate = `${dateParts[0] || '2024'}-${dateParts[1] || '01'}-${selectedOption.value}`;
      onChange({ target: { name, value: newDate } });
    },
    [value, name, onChange]
  );

  const handleYearChange = useCallback(
    (selectedOption: any) => {
      const dateParts = value.split('-');
      const newDate = `${selectedOption.value}-${dateParts[1] || '01'}-${dateParts[2] || '01'}`;
      onChange({ target: { name, value: newDate } });
    },
    [value, name, onChange]
  );

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#000',
      borderColor: '#fff',
      height: '40px',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#fff',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: '#fff',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#000',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#7B33E5' : '#000',
      color: '#fff',
    }),
  };

  return (
    <div className={styles.container}>
      {title && <label className={styles.title}>{title}</label>}
      <div className={styles.wrapper}>
        <div className={styles.selectContainer}>
          <label className={styles.selectTitle}>Dia</label>
          <Select
            className={styles.select}
            classNamePrefix="select"
            onChange={handleDayChange}
            options={options.day}
            value={options.day.find((option) => option.value === value.split('-')[2])}
            styles={customStyles}
          />
        </div>
        <div className={styles.selectContainer}>
          <label className={styles.selectTitle}>Mês</label>
          <Select
            className={styles.select}
            classNamePrefix="select"
            onChange={handleMonthChange}
            options={options.month}
            value={options.month.find((option) => option.value === value.split('-')[1])}
            styles={customStyles}
          />
        </div>
        <div className={styles.selectContainer}>
          <label className={styles.selectTitle}>Ano</label>
          <Select
            className={styles.select}
            classNamePrefix="select"
            onChange={handleYearChange}
            options={options.year}
            value={options.year.find((option) => option.value === value.split('-')[0])}
            styles={customStyles}
          />
        </div>
      </div>
      {bottomLeftText && <span className={styles.bottomLeftText}>{bottomLeftText}</span>}
    </div>
  );
};

export default memo(DateInput);
