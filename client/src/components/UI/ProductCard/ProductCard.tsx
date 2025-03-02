import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';

interface ButtonItem {
  image: string; // URL da imagem do botão
  link: string;
}

interface ProductCardProps {
  images: string[];
  name: string;
  price: number;
  freeShipping: boolean;
  buttons?: ButtonItem[];
}

const ProductCard: React.FC<ProductCardProps> = ({ images, name, price, freeShipping, buttons = [] }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null);

  const startScrolling = () => {
    if (!sliderRef.current) return;
    // Apenas inicia a rolagem se houver mais de uma imagem
    if (sliderRef.current.scrollWidth <= sliderRef.current.clientWidth) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        // Se atingir o final, reinicia a rolagem
        if (sliderRef.current.scrollLeft >= sliderRef.current.scrollWidth - sliderRef.current.clientWidth) {
          sliderRef.current.scrollLeft = 0;
        } else {
          sliderRef.current.scrollLeft += 2; // ajuste a velocidade conforme necessário
        }
      }
    }, 30); // ajuste o intervalo conforme necessário
    setScrollInterval(interval);
  };

  const stopScrolling = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
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
            {buttons.map((btn, index) => (
              <Link key={index} href={btn.link}>
                <div className={styles.buttonItem}>
                  <Image src={btn.image} alt="button icon" width={20} height={20} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.price}>R$ {price.toFixed(2)}</p>
        {freeShipping && <p className={styles.freeShipping}>Frete Grátis</p>}
      </div>
    </div>
  );
};

export default ProductCard;
