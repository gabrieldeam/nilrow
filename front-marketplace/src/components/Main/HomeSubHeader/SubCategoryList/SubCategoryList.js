import React, { useEffect, useState } from 'react';
import { getSubCategoriesByCategory } from '../../../../services/categoryApi'; 
import './SubCategoryList.css';
import { useNavigate, useParams } from 'react-router-dom';

const SubCategoryList = ({ categoryId, activeSubCategory }) => {
  const [subCategories, setSubCategories] = useState([]);
  const { categoryName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await getSubCategoriesByCategory(categoryId);
        setSubCategories([{ id: 'tudo', name: 'Tudo' }, ...response]); // Adiciona "Tudo" como primeira subcategoria
      } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
      }
    };

    if (categoryId) {
      fetchSubCategories();
    }
  }, [categoryId]);

  const handleSubCategoryClick = (subCategoryName) => {
    navigate(`/category/${categoryName}/${subCategoryName}`);
  };

  return (
    <div className="sub-category-container">
      {subCategories.length > 0 && subCategories.map((subCategory) => (
        <div
          key={subCategory.id}
          className={`sub-category-item ${activeSubCategory === subCategory.name.toLowerCase() ? 'active' : ''}`}
          onClick={() => handleSubCategoryClick(subCategory.name.toLowerCase())}
        >
          {subCategory.name}
        </div>
      ))}
    </div>
  );
};

export default SubCategoryList;
