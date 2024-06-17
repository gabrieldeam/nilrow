import React, { useState, useEffect, useMemo } from 'react';
import './FixedSlide.css';
import LoginSlide from '../../../pages/Auth/LoginSlide/LoginSlide';
import SlideFooter from '../../Main/SlideFooter/SlideFooter';
import { checkAuth } from '../../../services/api';

const FixedSlide = () => {
    const slides = useMemo(() => [
        {
            type: 'login',
            component: <LoginSlide />
        },
        {
            type: 'image',
            src: 'https://conteudo.imguol.com.br/c/noticias/ff/2018/08/31/compra-online-e-entrega-de-produtos-encomenda-internacional-comercio-eletronico-carrinho-de-compras-1535725447310_v2_450x600.jpg'
        },
        {
            type: 'image',
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaZt8Z_5UoAc_LTeDr_29jjjBTJyCrF7a68Q&s'
        }
    ], []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [filteredSlides, setFilteredSlides] = useState([]);

    useEffect(() => {
        const fetchAuthStatus = async () => {
            const { isAuthenticated } = await checkAuth();
            setIsAuthenticated(isAuthenticated);
        };

        fetchAuthStatus();
    }, []);

    useEffect(() => {
        if (isAuthenticated !== null) {
            const filtered = slides.filter(slide => slide.type !== 'login' || !isAuthenticated);
            setFilteredSlides(filtered);
            setCurrentIndex(0); // Reiniciar o índice quando os slides forem filtrados
        }
    }, [isAuthenticated, slides]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredSlides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredSlides.length) % filteredSlides.length);
    };

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Adicione um spinner ou similar aqui se desejar
    }

    return (
        <div className="fixed-slide">
            {filteredSlides[currentIndex]?.type === 'image' ? (
                <img className="fixed-slide-img" src={filteredSlides[currentIndex]?.src} alt="Slide" />
            ) : (
                filteredSlides[currentIndex]?.component
            )}
            <button className="prev-button" onClick={prevSlide}>❮</button>
            <button className="next-button" onClick={nextSlide}>❯</button>
            <div className="indicator-container">
                {filteredSlides.map((_, index) => (
                    <div
                        key={index}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                    ></div>
                ))}
            </div>
            <SlideFooter />
        </div>
    );
};

export default FixedSlide;
