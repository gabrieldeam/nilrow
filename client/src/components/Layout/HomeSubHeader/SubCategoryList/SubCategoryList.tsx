'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './SubCategoryList.module.css';

import { getSubCategoriesByCategory } from '../../../../services/categoryService';

interface SubCategoryListProps {
  categoryId: string | number;
  activeSubCategory: string;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({
  categoryId,
  activeSubCategory,
}) => {
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const router = useRouter();
  const params = useParams() as { categoryName?: string; subCategoryName?: string };

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await getSubCategoriesByCategory(categoryId);
        setSubCategories([{ id: 'tudo', name: 'Tudo' }, ...response]);
      } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
      }
    };

    if (categoryId) {
      fetchSubCategories();
    }
  }, [categoryId]);

  const handleSubCategoryClick = (subCategoryName: string) => {
    if (params.categoryName) {
      router.push(`/category/${params.categoryName}/${subCategoryName}`);
    }
  };

  return (
    <div className={styles['sub-category-container']}>
      {subCategories.length > 0 &&
        subCategories.map((subCategory) => {
          const subNameLower = subCategory.name.toLowerCase();
          return (
            <div
              key={subCategory.id}
              className={`${styles['sub-category-item']} ${
                activeSubCategory === subNameLower ? styles['active'] : ''
              }`}
              onClick={() => handleSubCategoryClick(subNameLower)}
            >
              {subCategory.name}
            </div>
          );
        })}
    </div>
  );
};

export default SubCategoryList;
