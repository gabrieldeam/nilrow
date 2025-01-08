'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import FixedSlide from '../components/Slides/FixedSlide/FixedSlide';
import HomeSubHeader from '../components/Layout/HomeSubHeader/HomeSubHeader';

import OnTheRise from '../components/Layout/Home/OnTheRise/OnTheRise';
import Following from '../components/Layout/Home/Following/Following';
import Curation from '../components/Layout/Home/Curation/Curation';
import Categories from '../components/Layout/Home/Categories/Categories';
import Default from '../components/Layout/Home/Default/Default';

import MobileHeader from '../components/Layout/MobileHeader/MobileHeader';
import ModalCategories from '../components/Modals/ModalCategories/ModalCategories';

import styles from './Page.module.css';

const Home: React.FC = () => {
  const [activeSection, setActiveSection] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('tudo');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Efeito para analisar o pathname e decidir qual seção mostrar
  useEffect(() => {
    const pathParts = pathname.split('/').filter(Boolean);
  
    if (pathParts.length === 0) {
      // URL raiz "/"
      setActiveSection('default');
      setSelectedCategory(null);
      setSelectedSubCategory('tudo');
      return;
    }
  
    const [firstSegment, secondSegment, thirdSegment] = pathParts;
  
    switch (firstSegment) {
      case 'ontherise':
        setActiveSection('ontherise');
        break;
      case 'following':
        setActiveSection('following');
        break;
      case 'curation':
        setActiveSection('curation');
        break;
      case 'categories':
        if (!secondSegment) {
          setActiveSection('categoriesList');
        }
        break;
      case 'category':
        if (secondSegment) {
          setSelectedCategory(secondSegment);
          setActiveSection('categories');
          setSelectedSubCategory(thirdSegment || 'tudo');
        }
        break;
      default:
        // Se o segmento não for reconhecido, redirecionar para a seção padrão
        setActiveSection('default');
        setSelectedCategory(null);
        setSelectedSubCategory('tudo');
        break;
    }
  }, [pathname]);  

  // Lida com mudanças de seção (chamado pelo HomeSubHeader)
  const handleSectionChange = (section: string) => {
    let newPath = '/';
  
    switch (section) {
      case 'default':
        setSelectedCategory(null);
        setSelectedSubCategory('tudo');
        setActiveSection('default');
        break;
  
      case 'categoriesList':
        setSelectedCategory(null);
        setSelectedSubCategory('tudo');
        setActiveSection('categoriesList');
        newPath = '/categories';
        break;
  
      default:
        if (section.startsWith('category/')) {
          const [, categoryName] = section.split('/');
          setSelectedCategory(categoryName);
          setSelectedSubCategory('tudo');
          setActiveSection('categories');
          newPath = `/category/${categoryName}/tudo`;
        } else {
          setSelectedCategory(null);
          setSelectedSubCategory('tudo');
          setActiveSection(section);
          newPath = `/${section}`;
        }
        break;
    }
  
    window.history.replaceState(null, '', newPath);
  };
  
  

  // Botão de 'Mais' para exibir modal ou ir para /categories
  const handleMoreClick = () => {
    if (window.innerWidth > 768) {
      setShowCategoriesModal(true);
    } else {
      handleSectionChange('categoriesList');
    }
  };

  // Renderiza a seção principal
  const renderSection = () => {
    switch (activeSection) {
      case 'ontherise':
        return <OnTheRise />;
      case 'following':
        return <Following />;
      case 'curation':
        return <Curation />;
      case 'categories':
        return <Categories selectedCategory={selectedCategory} />;
      case 'categoriesList':
        return <Categories selectedCategory={null}/>;
      default:
        return <Default />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'ontherise':
        return 'Em Alta';
      case 'following':
        return 'Seguindo';
      case 'curation':
        return 'Curadoria';
      case 'categories':
        return selectedCategory || 'Categorias';
      case 'categoriesList':
        return 'Categorias';
      default:
        return null;
    }
  };

  return (
    <div className={styles.homePage}>
      <MobileHeader
        title={getSectionTitle()}
        showLogo={activeSection === 'default'}
        buttons={{ address: true, bag: true }}
      />

      <FixedSlide />

      <HomeSubHeader
        onSectionChange={handleSectionChange}
        activeSection={activeSection}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        onMoreClick={handleMoreClick}
      />

      {renderSection()}

      {showCategoriesModal && <ModalCategories onClose={() => setShowCategoriesModal(false)} />}
    </div>
  );
};

export default Home;
