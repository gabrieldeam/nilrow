'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LoginSlide from '../../Auth/LoginSlide/LoginSlide';
import SlideFooter from '../SlideFooter/SlideFooter';
import { useAuthContext } from '../../../context/AuthContext'; 
import styles from './FixedSlide.module.css';

const FixedSlide: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const slides = useMemo(
    () => [
      { type: 'login', component: <LoginSlide /> },
      { type: 'image', src: 'https://conteudo.imguol.com.br/c/noticias/ff/2018/08/31/compra-online-e-entrega-de-produtos-encomenda-internacional-comercio-eletronico-carrinho-de-compras-1535725447310_v2_450x600.jpg' },
      { type: 'image', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaZt8Z_5UoAc_LTeDr_29jjjBTJyCrF7a68Q&s' },
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredSlides, setFilteredSlides] = useState(slides);

  useEffect(() => {
    const filtered = slides.filter(slide => slide.type !== 'login' || !isAuthenticated);
    setFilteredSlides(filtered);
    setCurrentIndex(0);
  }, [isAuthenticated, slides]);

  const nextSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % filteredSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + filteredSlides.length) % filteredSlides.length);
  };

  return (
    <div className={styles.fixedSlide}>
      {filteredSlides[currentIndex]?.type === 'image' ? (
        <img
          className={styles.fixedSlideImg}
          src={filteredSlides[currentIndex]?.src}
          alt="Slide"
        />
      ) : (
        filteredSlides[currentIndex]?.component
      )}
      <button className={styles.prevButton} onClick={prevSlide}>
        ❮
      </button>
      <button className={styles.nextButton} onClick={nextSlide}>
        ❯
      </button>
      <div className={styles.indicatorContainer}>
        {filteredSlides.map((_, index) => (
          <div
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
          ></div>
        ))}
      </div>
      <SlideFooter />
    </div>
  );
};

export default FixedSlide;