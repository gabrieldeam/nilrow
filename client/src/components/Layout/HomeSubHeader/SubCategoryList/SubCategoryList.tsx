'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SubCategoryList.module.css';

import { getSubCategoriesByCategory } from '../../../../services/categoryService';

interface SubCategoryListProps {
  categoryId: string | number;
  activeSubCategory: string;
  categoryName: string | null | undefined;
}

// Definindo um tipo para as subcategorias
interface SubCategory {
  id: string;
  name: string;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({
  categoryId,
  activeSubCategory,
  categoryName, 
}) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await getSubCategoriesByCategory(categoryId, 0, 9999);
        // Supondo que response.content seja um array de objetos compatíveis com SubCategory
        setSubCategories([{ id: 'tudo', name: 'Tudo' }, ...response.content]);
      } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
      }
    };
  
    if (categoryId) {
      fetchSubCategories();
    }
  }, [categoryId]);
  
  const handleSubCategoryClick = (subCategoryName: string) => {
    if (categoryName) {
      router.push(`/category/${categoryName}/${subCategoryName}`);
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
