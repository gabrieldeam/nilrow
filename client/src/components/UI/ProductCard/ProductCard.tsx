// src/components/UI/ProductCard/ProductCard.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCardProps } from '@/types/components/UI/ProductCard';
import styles from './ProductCard.module.css';

const ProductCard: React.FC<ProductCardProps> = ({
  images,
  name,
  price,
  discount,
  freeShipping,
  hideFreeShipping,
  buttons = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoverInterval, setHoverInterval] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startScrolling = () => {
    if (images.length <= 1 || hoverInterval) return;
    const interval = setInterval(
      () => setCurrentImageIndex(prev => (prev + 1) % images.length),
      1000
    );
    setHoverInterval(interval);
  };

  const stopScrolling = () => {
    if (hoverInterval) clearInterval(hoverInterval);
    setHoverInterval(null);
  };

  let priceElement = null;
  if (price != null) {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const numericDiscount = discount ? parseFloat(discount.toString()) : 0;
    const discountedPrice =
      numericDiscount > 0 ? numericPrice - (numericPrice * numericDiscount) / 100 : numericPrice;
    priceElement = (
      <p className={styles.price}>
        {numericDiscount > 0 ? (
          <>
            <span style={{ color: 'black' }}>R$ {discountedPrice.toFixed(2)}</span>
            <span
              style={{
                textDecoration: 'line-through',
                color: '#888',
                marginRight: '5px',
              }}
            >
              R$ {numericPrice.toFixed(2)}
            </span>
          </>
        ) : (
          <>R$ {numericPrice.toFixed(2)}</>
        )}
      </p>
    );
  }

  const getDisplayName = () => {
    const limit = isMobile ? 30 : 35;
    if (!mounted) return name;
    return name.length > limit ? `${name.substring(0, limit)}…` : name;
  };

  return (
    <div className={styles.card}>
      {/* Imagens */}
      <div
        className={styles.imageWrapper}
        onMouseEnter={startScrolling}
        onMouseLeave={stopScrolling}
      >
        <div
          className={styles.imageSlider}
          style={{ transform: `translateX(-${currentImageIndex * 165}px)` }}
        >
          {images.map((src, i) => (
            <div key={i} className={styles.imageItem}>
              <Image src={src} alt={`${name} ${i + 1}`} width={200} height={200} />
            </div>
          ))}
        </div>

        {/* Botões de ação (ícone ou imagem) */}
        {buttons.length > 0 && (
          <div className={styles.buttonContainer}>
            {buttons.map((btn, idx) => {
              // define o conteúdo: prefere o ReactNode `Icon`, senão a imagem
              const content = btn.Icon ?? (
                btn.image && <Image src={btn.image} alt="btn icon" width={20} height={20} />
              );

              if (btn.link) {
                return (
                  <Link
                      key={idx}
                      href={btn.link}
                      className={styles.buttonItem}
                      onClick={btn.onClick}
                    >
                      {content}
                  </Link>
                );
              } else {
                return (
                  <button
                    key={idx}
                    onClick={btn.onClick}
                    className={styles.buttonItem}
                    type="button"
                  >
                    {content}
                  </button>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Indicadores de scroll */}
      {images.length > 1 && (
        <div className={styles.indicators}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`${styles.indicator} ${
                i === currentImageIndex ? styles.active : ''
              }`}
              onClick={() => {
                setCurrentImageIndex(i);
                stopScrolling();
              }}
              type="button"
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{getDisplayName()}</h3>
        {priceElement}
        {!hideFreeShipping && (
          <p className={styles.freeShipping}>
            {freeShipping ? 'Frete Grátis' : 'Consultar Frete'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
