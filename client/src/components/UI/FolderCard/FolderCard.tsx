/* components/UI/FolderCard/FolderCard.tsx */
'use client';
import React from 'react';
import Image from 'next/image';
import styles from './FolderCard.module.css';
import { FavoriteFolderDTO } from '@/types/services/favorites';
import defaultImage from '/public/assets/user.png';

interface Props {
  folder: FavoriteFolderDTO;
  onMore?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const FolderCard: React.FC<Props> = ({ folder, onMore }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Garante 3 slots; fallback para defaultImage
  const thumbs = [0, 1, 2].map(idx => {
    const product = folder.productsPreview[idx];
    const img = product?.images?.[0];
    return img ? `${apiUrl}${img}` : defaultImage.src;
  });

  return (
    <div className={styles.card}>
      <div className={styles.thumbs}>
        {thumbs.map((src, i) => (
          <div key={i} className={styles.thumbWrapper}>
            <Image
              src={src}
              alt={`Preview ${i + 1}`}
              fill
              className={styles.thumb}
            />
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.name}>{folder.name}</span>
        {onMore && (
          <button className={styles.more} onClick={onMore}>
            ⋯
          </button>
        )}
      </div>
    </div>
  );
};

export default FolderCard;