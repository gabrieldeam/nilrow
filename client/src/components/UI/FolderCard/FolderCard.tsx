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

  /* três mini‑thumbs ou imagem padrão */
  const thumbs = folder.productsPreview.slice(0, 3).map((p) => {
  const first = p.images && p.images.length > 0 ? p.images[0] : null;
  return first
       ? `${apiUrl}${first}`
       : defaultImage.src;
  });
  // se tiver menos de 3, preenche com defaultImage
  while (thumbs.length < 3) thumbs.push(defaultImage.src);

  return (
    <div className={styles.card}>
      <div className={styles.thumbs}>
        {thumbs.map((src, i) => (
          <Image key={i} src={src} alt="" fill className={styles.thumb} />
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.name}>{folder.name}</span>
        <button className={styles.more} onClick={onMore}>
          ⋯
        </button>
      </div>
    </div>
  );
};

export default FolderCard;
