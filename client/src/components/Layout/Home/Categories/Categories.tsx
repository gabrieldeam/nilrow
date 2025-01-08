'use client';

import React from 'react';
import { CategoriesProps } from '../../../../types/components/Layout/category';
import styles from './Categories.module.css';

const Categories: React.FC<CategoriesProps> = ({ selectedCategory }) => {
  return (
    <div className={styles.sections}>
      <h2>Categoria: {selectedCategory || 'Nenhuma'}</h2>
    </div>
  );
};

export default Categories;
