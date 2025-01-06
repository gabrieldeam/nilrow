'use client';

import React from 'react';
import styles from './Categories.module.css';

interface CategoriesProps {
  selectedCategory: string;
}

const Categories: React.FC<CategoriesProps> = ({ selectedCategory }) => {
  return (
    <div className={styles.sections}>
      <h2>Categoria: {selectedCategory}</h2>
    </div>
  );
};

export default Categories;
