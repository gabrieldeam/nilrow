import React, { memo, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import { getAllCategories } from '../../../services/categoryApi';
import { getSubCategoriesByCategory } from '../../../services/categoryApi'; // Correct import
import getConfig from '../../../config';
import './Categories.css';

const { apiUrl } = getConfig();

const Categories = ({ onClose }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({}); // Map categoryId to subcategories
  const [loading, setLoading] = useState(true);

  const handleBack = useCallback(() => {
    if (onClose) {
      onClose(); // Close the modal without refreshing the page
    } else {
      navigate(-1); // Navigate back in history
    }
  }, [navigate, onClose]);

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      try {
        // Fetch all categories
        let allCategories = [];
        let page = 0;
        let size = 10;
        let hasMore = true;

        while (hasMore) {
          const response = await getAllCategories(page, size);
          if (response && response.content && response.content.length > 0) {
            allCategories = [...allCategories, ...response.content];
            page++;
          } else {
            hasMore = false;
          }
        }
        setCategories(allCategories);

        // Fetch subcategories for each category
        const subCategoriesData = {};

        for (const category of allCategories) {
          const subResponse = await getSubCategoriesByCategory(category.id);
          console.log(`Subcategories for category ${category.id}:`, subResponse);

          // Adjust this condition based on the actual response structure
          if (subResponse && subResponse.content && subResponse.content.length > 0) {
            subCategoriesData[category.id] = subResponse.content;
          } else if (Array.isArray(subResponse) && subResponse.length > 0) {
            subCategoriesData[category.id] = subResponse;
          } else {
            subCategoriesData[category.id] = [];
          }
        }

        setSubCategoriesMap(subCategoriesData);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching categories and subcategories', error);
        setLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();

  }, []);

  return (
    <div className="categories-container">
      <Helmet>
        <title>Categories</title>
        <meta name="description" content="Veja seus pedidos na Nilrow." />
      </Helmet>
      <MobileHeader
        title="Categorias"
        buttons={{ close: true }}
        handleBack={handleBack}
      />
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="categories-list">
          {categories.map(category => (
            <StepButton
              key={category.id}
              title={category.name}
              paragraph={
                subCategoriesMap[category.id] && subCategoriesMap[category.id].length > 0
                  ? subCategoriesMap[category.id].map(sub => sub.name).join(', ')
                  : 'Sem subcategorias'
              }
              icon={`${apiUrl}${category.imageUrl}`}
              onClick={() => {
                navigate(`/category/${category.name}/tudo`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(Categories);
