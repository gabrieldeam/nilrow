import React, { useEffect, useState } from 'react';
import './HomeSubHeader.css';
import { getAllCategories } from '../../../services/categoryApi';
import { checkAuth } from '../../../services/api'; // Importa o checkAuth
import ontheriseIcon from '../../../assets/ontherise.svg';
import followingIcon from '../../../assets/following.svg';
import curationIcon from '../../../assets/curation.svg';
import moreIcon from '../../../assets/more.svg';
import getConfig from '../../../config';
import SubCategoryList from './SubCategoryList/SubCategoryList';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const { apiUrl } = getConfig();

const HomeSubHeader = ({ onSectionChange, activeSection, selectedCategory, selectedSubCategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [visibleItems, setVisibleItems] = useState(4);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para verificar autenticação
  const navigate = useNavigate();
  const location = useLocation();

  // Carrega todas as categorias
  const fetchAllCategories = async () => {
    let allCategories = [];
    let page = 0;
    let size = 10;
    let hasMore = true;

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

    setCategories(allCategories);
  };

  // Verifica se o usuário está logado
  const verifyAuth = async () => {
    try {
      const { isAuthenticated } = await checkAuth(); // Verifica o campo isAuthenticated no retorno
      console.log('Autenticação verificada, está autenticado:', isAuthenticated);
      setIsAuthenticated(isAuthenticated); // Atualiza o estado com base na resposta
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false); // Define como não autenticado em caso de erro
    }
  };

  useEffect(() => {
    fetchAllCategories();
    verifyAuth(); // Verifica autenticação ao carregar o componente
  }, []);

  // Atualiza o número de itens visíveis conforme a largura da tela
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
        setVisibleItems(11);
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

  // Define o ID da categoria com base na categoria selecionada
  useEffect(() => {
    if (activeSection === 'categories' && selectedCategory) {
      const category = categories.find((cat) => cat.name === selectedCategory);
      if (category) {
        setSelectedCategoryId(category.id); // Define o ID da categoria
      }
    } else {
      setSelectedCategoryId(null); // Reseta o ID quando não estiver em categorias
    }
  }, [activeSection, selectedCategory, categories]);

  // Lida com a mudança de seção ou categoria
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

  // Filtra os itens de menu com base na autenticação
  const items = [
    { name: 'Em Alta', section: 'ontherise', icon: ontheriseIcon },
    isAuthenticated ? { name: 'Seguindo', section: 'following', icon: followingIcon } : null, // Exibe "Seguindo" apenas se autenticado
    { name: 'Curadoria', section: 'curation', icon: curationIcon }
  ].filter(Boolean); // Remove itens indefinidos

  return (
    <div className="homesubheader-container">
      <div className="subheader-container">
        {items.slice(0, visibleItems).map((item) => (
          <div
            key={item.section}
            className={`subheader-item-container ${activeSection === item.section ? 'active' : ''}`}
            onClick={() => handleClick(item.section)}
          >
            <div className={`subheader-item ${activeSection === item.section ? 'active' : ''}`}>
              <img
                src={item.icon}
                alt={`${item.name} icon`}
                className={`subheader-icon ${activeSection === item.section ? 'active' : ''}`}
              />
            </div>
            <span className="subheader-item-title">{item.name}</span>
          </div>
        ))}

        {categories.slice(0, visibleItems).map((category) => (
          <div
            key={category.id}
            className={`subheader-item-container ${(activeSection === 'categories' && selectedCategory === category.name) ? 'active' : ''}`}
            onClick={() => handleClick(`category/${category.name}`, true)}
          >
            <div className={`subheader-item ${(activeSection === 'categories' && selectedCategory === category.name) ? 'active' : ''}`}>
              <img
                src={`${apiUrl}${category.imageUrl}`}
                alt={`${category.name} icon`}
                className={`subheader-icon ${(activeSection === 'categories' && selectedCategory === category.name) ? 'active' : ''}`}
              />
            </div>
            <span className="subheader-item-title">{category.name}</span>
          </div>
        ))}

        <div
          className={`subheader-item-container ${activeSection === 'more' ? 'active' : ''}`}
          onClick={() => handleClick('more')}
        >
          <div className={`subheader-item ${activeSection === 'more' ? 'active' : ''}`}>
            <img
              src={moreIcon}
              alt="Mais icon"
              className={`subheader-icon ${activeSection === 'more' ? 'active' : ''}`}
            />
          </div>
          <span className="subheader-item-title">Mais</span>
        </div>
      </div>

      {/* Renderiza SubCategoryList quando estiver em uma categoria */}
      {activeSection === 'categories' && selectedCategoryId && (
        <SubCategoryList categoryId={selectedCategoryId} activeSubCategory={selectedSubCategory || 'tudo'} />
      )}
    </div>
  );
};

export default HomeSubHeader;
