'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

const HomeSubHeader: React.FC<HomeSubHeaderProps> = ({
  onSectionChange,
  activeSection,
  selectedCategory,
  selectedSubCategory,
  onMoreClick,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [userCategoryOrders, setUserCategoryOrders] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState(4);

  const { isAuthenticated } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  const fetchCategoriesWithOrder = async () => {
    let allCategories: any[] = [];
    let page = 0;
    let size = 10;
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
    }

    setCategories(allCategories);
  };

  useEffect(() => {
    fetchCategoriesWithOrder();

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
  }, [isAuthenticated, userCategoryOrders]); // Verifica quando isAuthenticated muda

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
      const [, categoryName] = section.split('/');
      const category = categories.find((cat) => cat.name === categoryName);
      const currentPath = `/category/${categoryName}/tudo`;
  
      if (activeSection === 'categories' && selectedCategory === category?.name) {
        onSectionChange('default');
        setSelectedCategoryId(null);
      } else if (pathname !== currentPath) {
        onSectionChange(section);
        setSelectedCategoryId(category?.id || null);
        // Atualiza o URL sem redirecionar
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
        // Atualiza o URL sem redirecionar
        window.history.replaceState(null, '', currentPath);
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
