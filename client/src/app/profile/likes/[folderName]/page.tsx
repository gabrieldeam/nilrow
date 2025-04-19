'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getProductsInFavoriteFolder,
  removeProductLike,
} from '@/services/favoriteService';
import { ProductDTO } from '@/types/services/product';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import defaultImg from '../../../../../public/assets/user.png';
import { LikeIcon } from '@/components/icons/LikeIcon';
import { capitalizeFirstLetter } from '@/utils/string';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import styles from './folder.module.css';

export default function FolderPage() {
  const { folderName } = useParams<{ folderName: string }>();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') setIsMobile(window.innerWidth <= 768);
    if (!folderName) return;
    getProductsInFavoriteFolder(decodeURIComponent(folderName))
      .then(res => setProducts(res.content))
      .finally(() => setLoading(false));
  }, [folderName]);

  const handleBack = useCallback(() => router.back(), [router]);
  const handleRemove = async (productId?: string) => {
    if (!productId || !folderName) return;
    try {
      await removeProductLike(productId, decodeURIComponent(folderName));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Carregando…</p>;
  const decoded = folderName ? decodeURIComponent(folderName) : '';
  const title = capitalizeFirstLetter(decoded);

  return (
    <div className={styles.likesPage}>
      {isMobile && (
        <MobileHeader title={title} buttons={{ bag: true, close: true }} handleBack={handleBack} />
      )}

      <div className={styles.likesContainer}>
        <SubHeader title={title} handleBack={handleBack} />

        {products.length === 0 ? (
          <p>Nenhum produto nesta pasta.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
            gap: '5px',
          }}>
            {products.map(p => (
              <div key={p.id} className={styles.productWrapper}>
                <Link
                  href={p.id ? `/product/${p.id}?nickname=${p.channel?.nickname}` : '#'}
                  className={styles.productLink}
                >
                  <ProductCard
                    images={p.images?.length ? p.images.map(img => `${apiUrl}${img}`) : [defaultImg.src]}
                    name={p.name}
                    price={p.salePrice}
                    discount={p.discountPrice}
                    freeShipping={p.freeShipping}
                    buttons={[
                      {
                        Icon: <LikeIcon className={styles.dislikeIcon} />, 
                        onClick: e => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(p.id);
                        }
                      }
                    ]}
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
