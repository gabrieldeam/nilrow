'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FolderCard from '@/components/UI/FolderCard/FolderCard';
import { FavoriteFolderDTO } from '@/types/services/favorites';
import { listFavoriteFolders } from '@/services/favoriteService';
import Modal from '@/components/Modals/Modal/Modal';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';

import styles from './likes.module.css';

export default function LikesPage() {
  const [folders, setFolders] = useState<FavoriteFolderDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [openModal, setOpen]    = useState<string | null>(null);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {

    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }

    listFavoriteFolders()
      .then(setFolders)
      .finally(() => setLoading(false));
  }, []);

    const handleBack = useCallback(() => {
      router.back();
    }, [router]);

  if (loading) return <p>Carregando…</p>;

  return (
    <div className={styles.likesPage}>

    {isMobile && (
        <MobileHeader title="Curtidas" buttons={{ bag: true, close: true }} handleBack={handleBack}/>
    )}

    <div className={styles.likesContainer}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,170px)',gap:'12px'}}>
        {folders.map((f) => (
          <div key={f.id} onClick={() => router.push(`/likes/${encodeURIComponent(f.name)}`)}>
            <FolderCard folder={f} onMore={(e) => { e.stopPropagation(); setOpen(f.name);} } />
          </div>
        ))}
      </div>

    </div>
      {/* modal de opções (placeholder) */}
      <Modal isOpen={!!openModal} onClose={() => setOpen(null)}>
        <p>Opções para a pasta <strong>{openModal}</strong> (em breve…)</p>
      </Modal>
    </div>
  );
}
