'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

import styles from './HomeSubHeader.module.css';

// Services
import { getAllCategories, getAllUserCategoryOrders } from '../../../services/categoryService';
import { checkAuth } from '../../../services/authService';

// Tipagem de props do componente (ajuste conforme sua estrutura)
import { HomeSubHeaderProps } from '../../../types/components/Layout/HomeSubHeaderProps';

// Imagens
import ontheriseIcon from '../../../../public/assets/ontherise.svg';
import followingIcon from '../../../../public/assets/following.svg';
import curationIcon from '../../../../public/assets/curation.svg';
import moreIcon from '../../../../public/assets/more.svg';

// Subcomponente
import SubCategoryList from './SubCategoryList/SubCategoryList';

// Variável de ambiente para URL da API
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

const HomeSubHeader: React.FC<HomeSubHeaderProps> = ({
  onSectionChange,
  activeSection,
  selectedCategory,
  selectedSubCategory,
  onMoreClick,
}) => {
  // Se quiser tipar mais forte, substitua `any[]` por `CategoryData[]` 
  const [categories, setCategories] = useState<any[]>([]);
  // Idem para userCategoryOrders -> `UserCategoryOrderDTO[]`
  const [userCategoryOrders, setUserCategoryOrders] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState(4);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Função para buscar as categorias e ordená-las
  const fetchCategoriesWithOrder = async () => {
    let allCategories: any[] = [];
    let page = 0;
    let size = 10;
    let hasMore = true;

    // Busca todas as categorias com paginação
    while (hasMore) {
      try {
        // getAllCategories(page, size) retorna CategoryData[]
        const response = await getAllCategories(page, size);
        // Ajuste: não existe 'content', então validamos diretamente no array
        if (response && response.length > 0) {
          allCategories = [...allCategories, ...response];
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
        // Em UserCategoryOrderDTO existe 'order', não 'displayOrder'
        allCategories.sort((a, b) => {
          const orderA = orders.find((order) => order.categoryId === a.id)?.order || 0;
          const orderB = orders.find((order) => order.categoryId === b.id)?.order || 0;
          return orderA - orderB;
        });
        setUserCategoryOrders(orders);
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
          fetchCategoriesWithOrder();
        }
      } catch (error) {
        console.error('Erro ao verificar a atualização da ordem das categorias:', error);
      }
    }, 2000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleClick = (section: string, isCategory = false) => {
    if (isCategory) {
      // Ex: section = 'category/Tech'
      const [, categoryName] = section.split('/');
      const category = categories.find((cat) => cat.name === categoryName);
      const currentPath = `/category/${categoryName}/tudo`;

      if (activeSection === 'categories' && selectedCategory === category?.name) {
        onSectionChange('default');
        setSelectedCategoryId(null);
      } else if (pathname !== currentPath) {
        onSectionChange(section);
        setSelectedCategoryId(category?.id || null);
        router.push(currentPath);
      }
    } else {
      // Ex: section = 'ontherise', 'following', 'curation'
      const currentPath = `/${section}`;

      if (activeSection === section) {
        onSectionChange('default');
        setSelectedCategoryId(null);
      } else if (pathname !== currentPath) {
        onSectionChange(section);
        setSelectedCategoryId(null);
        router.push(currentPath);
      }
    }
  };

  const items = [
    { name: 'Em Alta', section: 'ontherise', icon: ontheriseIcon },
    isAuthenticated
      ? { name: 'Seguindo', section: 'following', icon: followingIcon }
      : null,
    { name: 'Curadoria', section: 'curation', icon: curationIcon },
  ].filter(Boolean) as { name: string; section: string; icon: string }[];

  return (
    <div className={styles['homesubheader-container']}>
      <div className={styles['subheader-container']}>
        {/* Renderiza itens fixos (Em Alta, Seguindo, Curadoria) */}
        {items.slice(0, visibleItems).map((item) => (
          <div
            key={item.section}
            className={`${styles['subheader-item-container']} ${
              activeSection === item.section ? styles['active'] : ''
            }`}
            onClick={() => handleClick(item.section)}
          >
            <div
              className={`${styles['subheader-item']} ${
                activeSection === item.section ? styles['active'] : ''
              }`}
            >
              <Image
                src={item.icon}
                alt={`${item.name} icon`}
                width={34}
                height={34}
                className={`${styles['subheader-icon']} ${
                  activeSection === item.section ? styles['active'] : ''
                }`}
              />
            </div>
            <span className={styles['subheader-item-title']}>{item.name}</span>
          </div>
        ))}

        {/* Renderiza categorias */}
        {categories.slice(0, visibleItems).map((category) => (
          <div
            key={category.id}
            className={`${styles['subheader-item-container']} ${
              activeSection === 'categories' && selectedCategory === category.name
                ? styles['active']
                : ''
            }`}
            onClick={() => handleClick(`category/${category.name}`, true)}
          >
            <div
              className={`${styles['subheader-item']} ${
                activeSection === 'categories' && selectedCategory === category.name
                  ? styles['active']
                  : ''
              }`}
            >
              <Image
                src={`${apiUrl}${category.imageUrl}`}
                alt={`${category.name} icon`}
                width={34}
                height={34}
                className={`${styles['subheader-icon']} ${
                  activeSection === 'categories' && selectedCategory === category.name
                    ? styles['active']
                    : ''
                }`}
              />
            </div>
            <span className={styles['subheader-item-title']}>{category.name}</span>
          </div>
        ))}

        {/* Botão \"Mais\" */}
        <div
          className={`${styles['subheader-item-container']} ${
            activeSection === 'more' ? styles['active'] : ''
          }`}
          onClick={onMoreClick}
        >
          <div
            className={`${styles['subheader-item']} ${
              activeSection === 'more' ? styles['active'] : ''
            }`}
          >
            <Image
              src={moreIcon}
              alt="Mais icon"
              width={34}
              height={34}
              className={`${styles['subheader-icon']} ${
                activeSection === 'more' ? styles['active'] : ''
              }`}
            />
          </div>
          <span className={styles['subheader-item-title']}>Mais</span>
        </div>
      </div>

      {/* Se estiver em uma categoria, mostra SubCategoryList */}
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
