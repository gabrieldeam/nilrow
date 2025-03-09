import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCardProps } from '@/types/components/UI/ProductCard';
import styles from './ProductCard.module.css';

interface ExtendedProductCardProps extends ProductCardProps {
  discount?: string | number | null;
}

const ProductCard: React.FC<ExtendedProductCardProps> = ({
  images,
  name,
  price,
  discount,
  freeShipping,
  buttons = [],
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null);

  const startScrolling = () => {
    if (!sliderRef.current) return;
    if (sliderRef.current.scrollWidth <= sliderRef.current.clientWidth) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        if (
          sliderRef.current.scrollLeft >=
          sliderRef.current.scrollWidth - sliderRef.current.clientWidth
        ) {
          sliderRef.current.scrollLeft = 0;
        } else {
          sliderRef.current.scrollLeft += 2;
        }
      }
    }, 30);
    setScrollInterval(interval);
  };

  const stopScrolling = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
  };

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numericDiscount = discount ? parseFloat(discount.toString()) : 0;
  const discountedPrice =
    numericDiscount > 0 ? numericPrice - (numericPrice * numericDiscount) / 100 : numericPrice;

  // Estados para detectar se o componente foi montado e se é mobile.
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Função para verificar o tamanho da tela
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // ajuste o breakpoint conforme necessário
    };

    // Inicializa a verificação
    handleResize();

    // Adiciona o event listener para atualizar o estado em caso de redimensionamento
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define o limite de caracteres: 30 para mobile, 46 para desktop.
  // Enquanto não estiver montado (renderização inicial), mantém o nome completo para evitar diferença entre servidor e cliente.
  const getDisplayName = () => {
    const limit = isMobile ? 30 : 46;
    if (!mounted) return name;
    return name.length > limit ? `${name.substring(0, limit)}...` : name;
  };

  return (
    <div className={styles.card}>
      <div
        className={styles.imageWrapper}
        onMouseEnter={startScrolling}
        onMouseLeave={stopScrolling}
      >
        <div className={styles.imageSlider} ref={sliderRef}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageItem}>
              <Image src={img} alt={`${name} ${index + 1}`} width={190} height={190} />
            </div>
          ))}
        </div>
        {buttons.length > 0 && (
          <div className={styles.buttonContainer}>
            {buttons.map((btn, index) =>
              btn.link ? (
                <Link key={index} href={btn.link}>
                  <div className={styles.buttonItem}>
                    <Image src={btn.image} alt="button icon" width={20} height={20} />
                  </div>
                </Link>
              ) : (
                <button key={index} onClick={btn.onClick} className={styles.buttonItem}>
                  <Image src={btn.image} alt="button icon" width={20} height={20} />
                </button>
              )
            )}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{getDisplayName()}</h3>
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
        <p className={styles.freeShipping}>
          {freeShipping ? 'Frete Grátis' : 'Consultar Frete'}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
