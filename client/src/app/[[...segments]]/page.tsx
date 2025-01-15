'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter  } from 'next/navigation';

// Imports dos seus componentes:
import FixedSlide from '../../components/Slides/FixedSlide/FixedSlide';
import HomeSubHeader from '../../components/Layout/HomeSubHeader/HomeSubHeader';

import OnTheRise from '../../components/Layout/Home/OnTheRise/OnTheRise';
import Following from '../../components/Layout/Home/Following/Following';
import Curation from '../../components/Layout/Home/Curation/Curation';
import Categories from '../../components/Layout/Home/Categories/Categories';
import Default from '../../components/Layout/Home/Default/Default';

import MobileHeader from '../../components/Layout/MobileHeader/MobileHeader';
import ModalCategories from '../../components/Modals/ModalCategories/ModalCategories';

import styles from './Page.module.css';

const Home: React.FC = () => {
  const [activeSection, setActiveSection] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('tudo');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ex: "/ontherise" -> ["ontherise"]
    //     "/category/camisetas/tudo" -> ["category","camisetas","tudo"]
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
        setActiveSection('categoriesList');
        break;
      case 'category':
        if (secondSegment) {
          setSelectedCategory(secondSegment);
          setActiveSection('categories');
          setSelectedSubCategory(thirdSegment || 'tudo');
        }
        break;
      default:
        setActiveSection('default');
        setSelectedCategory(null);
        setSelectedSubCategory('tudo');
        break;
    }
  }, [pathname]);

  const handleSectionChange = (section: string) => {
    let newPath = '/';
    
    switch (section) {
      case 'default':
        setSelectedCategory(null);
        setSelectedSubCategory('tudo');
        setActiveSection('default');
        newPath = '/';
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

    // Atualiza o path sem forçar refresh
    window.history.replaceState(null, '', newPath);
  };

  const handleMoreClick = () => {
    if (window.innerWidth > 768) {
      setShowCategoriesModal(true);
    } else {
      router.push('/categories')
    }
  };

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
        return <Categories selectedCategory={null} />;
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
