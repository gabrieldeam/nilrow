'use client';

import React, { useState, memo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';

import styles from './melhorenvio.module.css';

// Importa as funções do serviço do Melhor Envio
import { 
  getMelhorEnvioStatus, 
  authorizeMelhorEnvio, 
  deactivateMelhorEnvio 
} from '@/services/melhorEnvio';

function Melhorenvio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [catalogId, setCatalogId] = useState<string | null>(null);

  useEffect(() => {
    const storedCatalogId = localStorage.getItem('selectedCatalogId');
    if (!storedCatalogId) {
      router.push('/channel/catalog/my');
    } else {
      setCatalogId(storedCatalogId);
    }
  }, [router]);

  // Função para voltar para a tela anterior
  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my/shipping');
  }, [router]);

  // Detecta se o dispositivo é mobile
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Ao montar a página, busca o status da integração
  useEffect(() => {
    if (!catalogId) return;
  
    async function fetchStatus() {
      setLoading(true);
      try {
        const statusData = await getMelhorEnvioStatus(catalogId!);
        if (statusData && typeof statusData.activated === 'boolean') {
          setActivated(statusData.activated);
        }
      } catch (err) {
        console.error('Erro ao buscar status do Melhor Envio:', err);
      } finally {
        setLoading(false);
      }
    }
  
    fetchStatus();
  }, [catalogId]);

  // Handler para "Ativar Melhor Envio"
  const handleAtivar = async () => {
    if (!catalogId) {
      console.error('Catalog ID is missing');
      return;
    }
    try {
      setLoading(true);
      // Chama o endpoint para iniciar o fluxo de autorização.
      // O backend retornará uma mensagem com a URL para autorizar.
      const urlOrMessage = await authorizeMelhorEnvio(catalogId);

      if (typeof urlOrMessage === 'string') {
        const urlMatch = urlOrMessage.match(/https:\/\/[^\s]+/);
        const url = urlMatch ? urlMatch[0] : urlOrMessage;
        window.open(url, '_blank');
      }
      
      // Após a autorização, aguarda alguns segundos e reconsulta o status da integração
      setTimeout(async () => {
        if (!catalogId) return; // Checa novamente
        const statusData = await getMelhorEnvioStatus(catalogId);
        if (statusData && typeof statusData.activated === 'boolean') {
          setActivated(statusData.activated);
        }
      }, 5000);
    } catch (error) {
      console.error('Erro ao ativar Melhor Envio:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para "Desativar" a integração
  const handleDesativar = async () => {
    if (!catalogId) {
      console.error('Catalog ID is missing');
      return;
    }
    try {
      setLoading(true);
      await deactivateMelhorEnvio(catalogId);
      setActivated(false);
    } catch (error) {
      console.error('Erro ao desativar Melhor Envio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.melhorenvioPage}>
      {isMobile && (
        <MobileHeader 
          title="Melhor Envio" 
          buttons={{ close: true }} 
          handleBack={handleBack} 
        />
      )}

      {loading && <LoadingSpinner />}

      <div className={styles.melhorenvioContainer}>
        <SubHeader title="Melhor Envio" handleBack={handleBack} />
        <div className={styles.melhorenvio}>
          {activated ? (
            <div>
              <p>Melhor Envio já está ativado para este catálogo.</p>
              <button onClick={handleDesativar}>
                Desativar
              </button>
            </div>
          ) : (
            <div>
              <p>Melhor Envio não está integrado a este catálogo.</p>
              <button onClick={handleAtivar}>
                Ativar Melhor Envio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Melhorenvio);
