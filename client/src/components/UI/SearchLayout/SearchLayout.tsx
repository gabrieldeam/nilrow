'use client';

import React from 'react';
import Image from 'next/image';
import styles from './SearchLayout.module.css';
import searchMobileIcon from '../../../../public/assets/setadireito.svg';

interface SearchLayoutProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchLayout: React.FC<SearchLayoutProps> = ({ placeholder, value, onChange, onSubmit }) => {
  return (
    <form className={styles.searchLayoutForm} onSubmit={onSubmit}>
      <button type="submit" className={styles.searchLayoutButton}>
        <Image src={searchMobileIcon} alt="Search" width={20} height={20} />
      </button>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.searchLayoutInput}
      />
    </form>
  );
};

export default SearchLayout;
