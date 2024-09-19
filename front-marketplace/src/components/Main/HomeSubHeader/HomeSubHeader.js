import React, { useEffect, useState } from 'react';
import './HomeSubHeader.css';
import { getAllCategories, getAllUserCategoryOrders } from '../../../services/categoryApi';
import { checkAuth } from '../../../services/api';
import ontheriseIcon from '../../../assets/ontherise.svg';
import followingIcon from '../../../assets/following.svg';
import curationIcon from '../../../assets/curation.svg';
import moreIcon from '../../../assets/more.svg';
import getConfig from '../../../config';
import SubCategoryList from './SubCategoryList/SubCategoryList';
import { useNavigate, useLocation } from 'react-router-dom';

const { apiUrl } = getConfig();

const HomeSubHeader = ({
  onSectionChange,
  activeSection,
  selectedCategory,
  selectedSubCategory,
  onMoreClick,
}) => {
  const [categories, setCategories] = useState([]);
  const [userCategoryOrders, setUserCategoryOrders] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [visibleItems, setVisibleItems] = useState(4);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Função para buscar as categorias e ordená-las
  const fetchCategoriesWithOrder = async () => {
    let allCategories = [];
    let page = 0;
    let size = 10;
    let hasMore = true;

    // Busca todas as categorias
    while (hasMore) {
      try {
        const response = await getAllCategories(page, size);
        if (response && response.content && response.content.length > 0) {
          allCategories = [...allCategories, ...response.content];
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        hasMore = false;
      }
    }

    // Tenta buscar a ordem das categorias do usuário
    try {
      const orders = await getAllUserCategoryOrders();
      if (orders && Array.isArray(orders)) {
        // Ordena as categorias de acordo com a ordem do usuário
        allCategories.sort((a, b) => {
          const orderA = orders.find(order => order.categoryId === a.id)?.displayOrder || 0;
          const orderB = orders.find(order => order.categoryId === b.id)?.displayOrder || 0;
          return orderA - orderB;
        });
        setUserCategoryOrders(orders); // Armazena a ordem atual
      }
    } catch (error) {
      console.error('Erro ao buscar ordem das categorias, usando ordem padrão:', error);
    }

    setCategories(allCategories);
  };

  // Verificar autenticação
  const verifyAuth = async () => {
    try {
      const { isAuthenticated } = await checkAuth();
      setIsAuthenticated(isAuthenticated);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithOrder();
    verifyAuth();

    // Intervalo de 2 segundos para verificar se a ordem foi modificada
    const intervalId = setInterval(async () => {
      try {
        const newOrders = await getAllUserCategoryOrders();

        // Verifica se a ordem mudou comparando o novo array com o anterior
        if (JSON.stringify(newOrders) !== JSON.stringify(userCategoryOrders)) {
          console.log('A ordem das categorias foi modificada, atualizando...');
          fetchCategoriesWithOrder(); // Atualiza as categorias se houver mudanças
        }
      } catch (error) {
        console.error('Erro ao verificar a atualização da ordem das categorias:', error);
      }
    }, 2000); // Verifica a cada 2 segundos

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, [userCategoryOrders]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth <= 768) {
        setVisibleItems(3);
      } else if (screenWidth > 768 && screenWidth <= 1050) {
        setVisibleItems(5);
      } else if (screenWidth > 1050 && screenWidth <= 1100) {
        setVisibleItems(10);
      } else if (screenWidth > 1100 && screenWidth <= 1261) {
        setVisibleItems(8);
      } else if (screenWidth > 1261 && screenWidth <= 1379) {
        setVisibleItems(12);
      } else if (screenWidth > 1379 && screenWidth <= 1469) {
        setVisibleItems(6);
      } else if (screenWidth > 1469 && screenWidth <= 1602) {
        setVisibleItems(7);
      } else if (screenWidth > 1602 && screenWidth <= 1680) {
        setVisibleItems(8);
      } else {
        setVisibleItems(12);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (activeSection === 'categories' && selectedCategory) {
      const category = categories.find((cat) => cat.name === selectedCategory);
      if (category) {
        setSelectedCategoryId(category.id);
      }
    } else {
      setSelectedCategoryId(null);
    }
  }, [activeSection, selectedCategory, categories]);

  const handleClick = (section, isCategory = false) => {
    if (isCategory) {
      const [, categoryName] = section.split('/');
      const category = categories.find((cat) => cat.name === categoryName);
      const currentPath = `/category/${categoryName}/tudo`;

      if (activeSection === 'categories' && selectedCategory === category.name) {
        onSectionChange('default');
        setSelectedCategoryId(null);
      } else if (location.pathname !== currentPath) {
        onSectionChange(section);
        setSelectedCategoryId(category.id);
        navigate(currentPath);
      }
    } else {
      const currentPath = `/${section}`;

      if (activeSection === section) {
        onSectionChange('default');
        setSelectedCategoryId(null);
      } else if (location.pathname !== currentPath) {
        onSectionChange(section);
        setSelectedCategoryId(null);
        navigate(currentPath);
      }
    }
  };

  const items = [
    { name: 'Em Alta', section: 'ontherise', icon: ontheriseIcon },
    isAuthenticated
      ? { name: 'Seguindo', section: 'following', icon: followingIcon }
      : null,
    { name: 'Curadoria', section: 'curation', icon: curationIcon },
  ].filter(Boolean);

  return (
    <div className="homesubheader-container">
      <div className="subheader-container">
        {items.slice(0, visibleItems).map((item) => (
          <div
            key={item.section}
            className={`subheader-item-container ${
              activeSection === item.section ? 'active' : ''
            }`}
            onClick={() => handleClick(item.section)}
          >
            <div
              className={`subheader-item ${
                activeSection === item.section ? 'active' : ''
              }`}
            >
              <img
                src={item.icon}
                alt={`${item.name} icon`}
                className={`subheader-icon ${
                  activeSection === item.section ? 'active' : ''
                }`}
              />
            </div>
            <span className="subheader-item-title">{item.name}</span>
          </div>
        ))}

        {categories.slice(0, visibleItems).map((category) => (
          <div
            key={category.id}
            className={`subheader-item-container ${
              activeSection === 'categories' && selectedCategory === category.name
                ? 'active'
                : ''
            }`}
            onClick={() => handleClick(`category/${category.name}`, true)}
          >
            <div
              className={`subheader-item ${
                activeSection === 'categories' && selectedCategory === category.name
                  ? 'active'
                  : ''
              }`}
            >
              <img
                src={`${apiUrl}${category.imageUrl}`}
                alt={`${category.name} icon`}
                className={`subheader-icon ${
                  activeSection === 'categories' && selectedCategory === category.name
                    ? 'active'
                    : ''
                }`}
              />
            </div>
            <span className="subheader-item-title">{category.name}</span>
          </div>
        ))}

        <div
          className={`subheader-item-container ${
            activeSection === 'more' ? 'active' : ''
          }`}
          onClick={onMoreClick}
        >
          <div
            className={`subheader-item ${
              activeSection === 'more' ? 'active' : ''
            }`}
          >
            <img
              src={moreIcon}
              alt="Mais icon"
              className={`subheader-icon ${
                activeSection === 'more' ? 'active' : ''
              }`}
            />
          </div>
          <span className="subheader-item-title">Mais</span>
        </div>
      </div>

      {activeSection === 'categories' && selectedCategoryId && (
        <SubCategoryList
          categoryId={selectedCategoryId}
          activeSubCategory={selectedSubCategory || 'tudo'}
        />
      )}
    </div>
  );
};

export default HomeSubHeader;
