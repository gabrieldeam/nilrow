import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import FixedSlide from '../components/Others/FixedSlide/FixedSlide';
import HomeSubHeader from '../components/Main/HomeSubHeader/HomeSubHeader';

import OnTheRise from '../components/Sections/OnTheRise';
import Following from '../components/Sections/Following';
import Curation from '../components/Sections/Curation';
import Categories from '../components/Sections/Categories';
import Default from '../components/Sections/Default';

import MobileHeader from '../components/Main/MobileHeader/MobileHeader';
import ModalCategories from '../components/UI/ModalCategories/ModalCategories'; 
import './Home.css';

const Home = () => {
    const [activeSection, setActiveSection] = useState('default');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState('tudo');
    const [showCategoriesModal, setShowCategoriesModal] = useState(false); 
    const location = useLocation();
    const { categoryName, subCategoryName } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const path = location.pathname;

        if (path === '/ontherise') {
            setActiveSection('ontherise');
        } else if (path === '/following') {
            setActiveSection('following');
        } else if (path === '/curation') {
            setActiveSection('curation');
        } else if (path === '/categories') {
            setActiveSection('categoriesList');
        } else if (categoryName) {
            setSelectedCategory(categoryName);
            setActiveSection('categories');

            if (!subCategoryName) {
                setSelectedSubCategory('tudo');
                navigate(`/category/${categoryName}/tudo`, { replace: true });
            } else {
                setSelectedSubCategory(subCategoryName);
            }
        } else {
            setActiveSection('default');
        }
    }, [location, categoryName, subCategoryName, navigate]);

    const handleSectionChange = (section) => {
        if (section === 'default') {
            setSelectedCategory(null);
            setSelectedSubCategory('tudo');
            setActiveSection('default');
            navigate('/', { replace: true });
        } else if (section.startsWith('category/')) {
            const categoryName = section.split('/')[1];
            setSelectedCategory(categoryName);
            setActiveSection('categories');
            setSelectedSubCategory('tudo');
            navigate(`/category/${categoryName}/tudo`);
        } else if (section === 'categoriesList') {
            setSelectedCategory(null);
            setSelectedSubCategory('tudo');
            setActiveSection('categoriesList');
            navigate('/categories');
        } else {
            setSelectedCategory(null);
            setSelectedSubCategory('tudo');
            setActiveSection(section);
            navigate(`/${section}`);
        }
    };

    const handleMoreClick = () => {
        if (window.innerWidth > 768) {
            setShowCategoriesModal(true);
        } else {
            handleSectionChange('categoriesList');
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
                return <Categories />;
            case 'default':
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
        <div className="home-page">
            <Helmet>
                <title>Home - Nilrow</title>
                <meta name="description" content="Welcome to the Nilrow home page." />
            </Helmet>

            {/* Render MobileHeader */}
            {activeSection === 'default' ? (
                <MobileHeader showLogo={true} buttons={{ address: true, bag: true }} />
            ) : (
                <MobileHeader title={getSectionTitle()} buttons={{ address: true, bag: true }} />
            )}

            <FixedSlide />
            <HomeSubHeader 
                onSectionChange={handleSectionChange} 
                activeSection={activeSection} 
                selectedCategory={selectedCategory} 
                selectedSubCategory={selectedSubCategory}
                onMoreClick={handleMoreClick}
            />
            {renderSection()}

            {/* Render ModalCategories when showCategoriesModal is true */}
            {showCategoriesModal && (
                <ModalCategories onClose={() => setShowCategoriesModal(false)} />
            )}
        </div>
    );
};

export default Home;
