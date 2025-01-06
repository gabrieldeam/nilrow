'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LoginSlide from '../../Auth/LoginSlide/LoginSlide';
import SlideFooter from '../SlideFooter/SlideFooter';
import { checkAuth } from '../../../services/authService';
import styles from './FixedSlide.module.css';

const FixedSlide: React.FC = () => {
  const slides = useMemo(
    () => [
      { type: 'login', component: <LoginSlide /> },
      { type: 'image', src: '/assets/sample-image1.jpg' }, 
      { type: 'image', src: '/assets/sample-image2.jpg' },
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [filteredSlides, setFilteredSlides] = useState(slides);

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
      setCurrentIndex(0); 
    }
  }, [isAuthenticated, slides]);

  const nextSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % filteredSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + filteredSlides.length) % filteredSlides.length);
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Spinner pode ser adicionado aqui
  }

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
