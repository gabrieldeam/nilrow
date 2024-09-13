import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom'; 
import FixedSlide from '../components/Others/FixedSlide/FixedSlide';
import MobileHeader from '../components/Main/MobileHeader/MobileHeader';
import HomeSubHeader from '../components/Main/HomeSubHeader/HomeSubHeader';
import { getMyFollowingChannels } from '../services/channelApi'; 
import { getAllCategories } from '../services/categoryApi'; 
import FollowingSection from './Main/FollowingSection/FollowingSection';
import { checkAuth } from '../services/api';
import './Home.css';

const Home = ({ initialSection }) => {
    const isMobile = window.innerWidth <= 768;    
    const [activeSection, setActiveSection] = useState(initialSection || null);
    const followingChannelsRef = useRef([]); 
    const [followingChannels, setFollowingChannels] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [categories, setCategories] = useState([]); 
    const navigate = useNavigate();
    const { categoryName } = useParams(); // Pega o nome da categoria da URL

    useEffect(() => {
        const verifyAuth = async () => {
            const authStatus = await checkAuth();
            setIsAuthenticated(authStatus.isAuthenticated);
        };

        verifyAuth();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                let allCategories = [];
                let currentPage = 0;
                let totalPages = 1;
                const pageSize = 10;

                while (currentPage < totalPages) {
                    const response = await getAllCategories(currentPage, pageSize);
                    allCategories = [...allCategories, ...response.content];
                    totalPages = response.totalPages;
                    currentPage++;
                }

                setCategories(allCategories);

                // Verifica se o categoryName da URL corresponde a alguma categoria carregada
                if (categoryName) {
                    const matchedCategory = allCategories.find(category => category.name.toLowerCase() === categoryName.toLowerCase());
                    if (matchedCategory) {
                        setActiveSection(matchedCategory.id); // Define a seção ativa com o ID da categoria
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
            }
        };

        fetchCategories();
    }, [categoryName]);

    const fetchFollowingChannels = useCallback(async (page) => {
        try {
            const response = await getMyFollowingChannels(page, 10);
            if (response) {
                followingChannelsRef.current = [...followingChannelsRef.current, ...response];
                setFollowingChannels(followingChannelsRef.current);
            } else {
                console.error("API response data is undefined");
            }
        } catch (error) {
            console.error("Error fetching following channels", error);
        }
    }, []);

    useEffect(() => {
        if (activeSection === 'following' && isAuthenticated) {
            if (followingChannelsRef.current.length === 0) {
                fetchFollowingChannels(0);
            }
        }
    }, [activeSection, isAuthenticated, fetchFollowingChannels]);

    const handleButtonClick = (buttonType) => {
        if (buttonType === 'following' && !isAuthenticated) {
            navigate('/login');
        } else {
            const selectedCategory = categories.find(category => category.id === buttonType);
            if (selectedCategory) {
                setActiveSection(buttonType);
                navigate(`/category/${selectedCategory.name.toLowerCase()}`);
            } else {
                setActiveSection(prevSection => prevSection === buttonType ? null : buttonType);
                navigate(`/${buttonType}`);
            }
        }
    };

    const handleBack = useCallback(() => {
        setActiveSection(null);
        navigate('/');
    }, [navigate]);

    const renderSection = () => {
        switch (activeSection) {
            case 'ontherise':
                return <div className="section-content">Em Alta</div>;
            case 'following':
                return isAuthenticated ? (
                    <FollowingSection channels={followingChannels} />
                ) : (
                    <div className="section-content">Por favor, faça login para ver esta seção.</div>
                );
            case 'curation':
                return <div className="section-content">Curadoria</div>;
            default:
                const selectedCategory = categories.find(category => category.id === activeSection);
                return selectedCategory ? (
                    <div className="section-content">{`Seção de "${selectedCategory.name}"`}</div>
                ) : (
                    <div className="section-content">Seção Padrão</div>
                );
        }
    };

    const renderMobileHeader = () => {
        switch (activeSection) {
            case 'ontherise':
                return <MobileHeader showLogo={true} buttons={{ address: true, bag: true }} />;
            case 'following':
                return <MobileHeader title="Seguindo" buttons={{ close: true, address: true, bag: true, blocked: true }} handleBack={handleBack} />;
            case 'curation':
                return <MobileHeader showLogo={true} buttons={{ address: true, bag: true }} />;
            default:
                return <MobileHeader showLogo={true} buttons={{ address: true, bag: true }} />;
        }
    };

    return (
        <div className="home-page">
            <Helmet>
                <title>Home - Nilrow</title>
                <meta name="description" content="Welcome to the Nilrow home page." />
            </Helmet>
            <FixedSlide />
            {isMobile && renderMobileHeader()}
            <HomeSubHeader activeSection={activeSection} onButtonClick={handleButtonClick} categories={categories} />
            <div className="section-container">
                {renderSection()}
            </div>
        </div>
    );
};

export default memo(Home);
