// src/app/profile/likes/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FolderCard from '@/components/UI/FolderCard/FolderCard';
import { FavoriteFolderDTO } from '@/types/services/favorites';
import {
  listFavoriteFolders,
  renameFavoriteFolder,
} from '@/services/favoriteService';
import Modal from '@/components/Modals/Modal/Modal';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import { useNotification } from '@/hooks/useNotification';

import styles from './likes.module.css';

export default function LikesPage() {
  const [folders, setFolders] = useState<FavoriteFolderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { setMessage } = useNotification();

  useEffect(() => {
    // Ajuste: detectar se resultado é array ou wrapper
    const fetchFolders = async () => {
      try {
        const result = await listFavoriteFolders();
        // Se vier wrapper { data, message }
        let data: FavoriteFolderDTO[];
        let msg: string;
        if (Array.isArray(result)) {
          data = result;
          msg = 'Pastas carregadas com sucesso';
        } else {
          data = result.data;
          msg = result.message;
        }
        setFolders(data);
        setMessage(msg, 'success');
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Ocorreu um erro ao carregar pastas';
        setMessage(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };

    // Detectar viewport
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }

    fetchFolders();
  }, [setMessage]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const openRenameModal = (folder: FavoriteFolderDTO) => {
    setOpenFolderId(folder.id);
    setRenameValue(folder.name);
  };

  const handleRename = async () => {
    if (!openFolderId) return;
    try {
      const updated = await renameFavoriteFolder(openFolderId, renameValue);
      setFolders((prev) =>
        prev.map((f) => (f.id === openFolderId ? updated : f))
      );
      setMessage('Pasta renomeada com sucesso', 'success');
      setOpenFolderId(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Erro ao renomear a pasta';
      setMessage(msg, 'error');
    }
  };

  if (loading) return <p>Carregando…</p>;

  return (
    <div className={styles.likesPage}>
      {isMobile && (
        <MobileHeader
          title="Curtidas"
          buttons={{ bag: true, close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles.likesContainer}>
        <SubHeader title="Curtidas" handleBack={handleBack} />

        {folders && folders.length > 0 ? (
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '8px',
            }}
          >
            {folders.map((f) => (
              <div
                key={f.id}
                onClick={() =>
                  router.push(
                    `/profile/likes/${encodeURIComponent(f.name)}`
                  )
                }
              >
                <FolderCard
                  folder={f}
                  onMore={(e) => {
                    e.stopPropagation();
                    openRenameModal(f);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma pasta encontrada</p>
        )}
      </div>

      <Modal isOpen={!!openFolderId} onClose={() => setOpenFolderId(null)}>
        <h2>Renomear pasta</h2>
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          className={styles.renameInput}
          placeholder="Novo nome da pasta"
        />
        <div className={styles.modalActions}>
          <button onClick={() => setOpenFolderId(null)}>Cancelar</button>
          <button
            onClick={handleRename}
            disabled={
              !renameValue.trim() ||
              renameValue ===
                folders.find((f) => f.id === openFolderId)?.name
            }
          >
            Salvar
          </button>
        </div>
      </Modal>
    </div>
  );
}
