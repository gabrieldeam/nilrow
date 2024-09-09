import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import FixedSlide from '../components/Others/FixedSlide/FixedSlide';
import MobileHeader from '../components/Main/MobileHeader/MobileHeader';
import HomeSubHeader from '../components/Main/HomeSubHeader/HomeSubHeader';
import { getMyFollowingChannels } from '../services/channelApi'; 
import FollowingSection from './Main/FollowingSection/FollowingSection';
import { checkAuth } from '../services/api';
import './Home.css';

const Home = ({ initialSection }) => {
    const isMobile = window.innerWidth <= 768;
    const [activeSection, setActiveSection] = useState(initialSection || null);
    const followingChannelsRef = useRef([]);
    const [followingChannels, setFollowingChannels] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [page, setPage] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            const authStatus = await checkAuth();
            setIsAuthenticated(authStatus.isAuthenticated);
        };

        verifyAuth();
    }, []);

    const fetchFollowingChannels = useCallback(async (page) => {
        try {
            const response = await getMyFollowingChannels(page, 10);
            if (response) {
                // Armazena no ref e no estado
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
                fetchFollowingChannels(page); // Apenas busca se ainda não foi carregado
            } else {
                setFollowingChannels(followingChannelsRef.current); // Usa os dados já carregados
            }
        }
    }, [activeSection, isAuthenticated, page, fetchFollowingChannels]);

    useEffect(() => {
        if (initialSection) {
            setActiveSection(initialSection);
        }
    }, [initialSection]);

    useEffect(() => {
        if (location.pathname === '/') {
            setActiveSection(null);
        }
    }, [location.pathname]);

    const handleButtonClick = (buttonType) => {
        if (buttonType === 'following' && !isAuthenticated) {
            navigate('/login'); // Redireciona para o login se não autenticado
        } else {
            setActiveSection(prevSection => prevSection === buttonType ? null : buttonType);
            navigate(`/${buttonType}`);
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
                return isAuthenticated ? <FollowingSection channels={followingChannels} onLoadMore={() => setPage(prevPage => prevPage + 1)} /> : <div className="section-content">Please log in to see this section.</div>;
            case 'curation':
                return <div className="section-content">Curadoria</div>;
            default:
                return <div className="section-content">Seção Padrão</div>;
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
            <HomeSubHeader activeSection={activeSection} onButtonClick={handleButtonClick} />
            <div className="section-container">
                {renderSection()}
            </div>
        </div>
    );
};

export default memo(Home);