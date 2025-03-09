'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './HomeSubHeader.module.css';
import { getAllCategories, getAllUserCategoryOrders } from '../../../services/categoryService';
import { HomeSubHeaderProps } from '../../../types/components/Layout/HomeSubHeaderProps';
import ontheriseIcon from '../../../../public/assets/ontherise.svg';
import followingIcon from '../../../../public/assets/following.svg';
import curationIcon from '../../../../public/assets/curation.svg';
import moreIcon from '../../../../public/assets/more.svg';
import SubCategoryList from './SubCategoryList/SubCategoryList';
import { useAuth } from '../../../hooks/useAuth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// Definindo tipos para as categorias e para a ordem do usuário
interface Category {
  id: string;
  name: string;
  imageUrl: string;
  // outros campos se necessário
}

interface UserCategoryOrder {
  categoryId: string;
  displayOrder: number;
}

const HomeSubHeader: React.FC<HomeSubHeaderProps> = ({
  onSectionChange,
  activeSection,
  selectedCategory,
  selectedSubCategory,
  onMoreClick,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCategoryOrders, setUserCategoryOrders] = useState<UserCategoryOrder[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<number>(4);

  const { isAuthenticated } = useAuth(); 
  const pathname = usePathname();

  // Função para buscar categorias com a ordem definida
  const fetchCategoriesWithOrder = useCallback(async () => {
    let allCategories: Category[] = [];
    let page = 0;
    const size = 10; // tamanho constante
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await getAllCategories(page, size);
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

    if (isAuthenticated) { 
      try {
        const orders = await getAllUserCategoryOrders();
        if (orders && Array.isArray(orders)) {
          // Ordena as categorias conforme o displayOrder definido pelo usuário
          allCategories.sort((a, b) => {
            const orderA =
              orders.find((order: UserCategoryOrder) => order.categoryId === a.id)?.displayOrder || 0;
            const orderB =
              orders.find((order: UserCategoryOrder) => order.categoryId === b.id)?.displayOrder || 0;
            return orderA - orderB;
          });
          setUserCategoryOrders(orders);
        }
      } catch (error) {
        console.error('Erro ao buscar ordem das categorias, usando ordem padrão:', error);
      }
    }

    setCategories(allCategories);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCategoriesWithOrder();
  }, [fetchCategoriesWithOrder]);

  useEffect(() => {
    if (isAuthenticated) {
      const intervalId = setInterval(async () => {
        try {
          const newOrders = await getAllUserCategoryOrders();
          if (JSON.stringify(newOrders) !== JSON.stringify(userCategoryOrders)) {
            console.log('A ordem das categorias foi modificada, atualizando...');
            fetchCategoriesWithOrder();
          }
        } catch (error) {
          console.error('Erro ao verificar a atualização da ordem das categorias:', error);
        }
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, userCategoryOrders, fetchCategoriesWithOrder]);

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

  // Atualiza o ID da categoria selecionada, se houver
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

  // Clique em "Em Alta", "Seguindo", "Curadoria" ou em uma das categorias
  const handleClick = (section: string, isCategory = false) => {
    if (isCategory) {
      const [, categoryName] = section.split('/');
      const category = categories.find((cat) => cat.name === categoryName);
      const currentPath = `/category/${categoryName}/tudo`;
  
      if (activeSection === 'categories' && selectedCategory === category?.name) {
        onSectionChange('default');
        setSelectedCategoryId(null);
      } else if (pathname !== currentPath) {
        onSectionChange(section);
        setSelectedCategoryId(category?.id || null);
        window.history.replaceState(null, '', currentPath);
      }
    } else {
      const currentPath = `/${section}`;
  
      if (activeSection === section) {
        onSectionChange('default');
        setSelectedCategoryId(null);
      } else if (pathname !== currentPath) {
        onSectionChange(section);
        setSelectedCategoryId(null);
        window.history.replaceState(null, '', currentPath);
      }
    }
  };

  // Botões fixos: Em Alta, Seguindo, Curadoria
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
        {/* Botões "Em Alta", "Seguindo", "Curadoria" */}
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

        {/* Lista das categorias do backend */}
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

        {/* Botão "Mais" */}
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

      {/* Renderiza a SubCategoryList se o usuário estiver na categoria */}
      {activeSection === 'categories' && selectedCategoryId && (
        <SubCategoryList
          categoryId={selectedCategoryId}
          activeSubCategory={selectedSubCategory || 'tudo'}
          categoryName={selectedCategory} // prop crucial
        />
      )}
    </div>
  );
};

export default HomeSubHeader;
