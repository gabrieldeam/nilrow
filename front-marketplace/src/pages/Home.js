import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import FixedSlide from '../components/Others/FixedSlide/FixedSlide';
import HomeSubHeader from '../components/Main/HomeSubHeader/HomeSubHeader';
import OnTheRise from '../components/Sections/OnTheRise';
import Following from '../components/Sections/Following';
import Curation from '../components/Sections/Curation';
import Categories from '../components/Sections/Categories';
import More from '../components/Sections/More';
import Default from '../components/Sections/Default';
import MobileHeader from '../components/Main/MobileHeader/MobileHeader';
import './Home.css';

const Home = () => {
    const [activeSection, setActiveSection] = useState('default');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState('tudo');
    const location = useLocation();
    const { categoryName, subCategoryName } = useParams();
    const navigate = useNavigate();

    // Atualiza a seção ativa e a subcategoria com base na URL
    useEffect(() => {
        const path = location.pathname;

        if (path === '/ontherise') {
            setActiveSection('ontherise');
        } else if (path === '/following') {
            setActiveSection('following');
        } else if (path === '/curation') {
            setActiveSection('curation');
        } else if (path === '/more') {
            setActiveSection('more');
        } else if (categoryName) {
            setSelectedCategory(categoryName);
            setActiveSection('categories');

            // Se nenhuma subcategoria for definida, define "Tudo" como padrão
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
        } else {
            setSelectedCategory(null);
            setSelectedSubCategory('tudo');
            setActiveSection(section);
            navigate(`/${section}`);
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
            case 'more':
                return <More />;
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
            case 'more':
                return 'Mais';
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

            {/* Renderiza o MobileHeader */}
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
            />
            {renderSection()}
        </div>
    );
};

export default Home;
