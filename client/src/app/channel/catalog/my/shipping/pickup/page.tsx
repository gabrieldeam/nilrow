'use client';

import React, { useState, memo, useCallback, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import styles from './pickup.module.css';
import { getPickupByCatalogId, createPickup, updatePickup, deletePickup } from '@/services/pickupService';
import { PickupDTO } from '@/types/services/pickup';

function Pickup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [pickup, setPickup] = useState<PickupDTO | null>(null);
  
  // Estado para os valores do formulário
  const [formValues, setFormValues] = useState({
    active: false,
    prazoRetirada: 0,
    precoRetirada: 0,
  });

  // Busca o catalogId do localStorage e, se não existir, redireciona
  useEffect(() => {
    const storedCatalogId = localStorage.getItem('selectedCatalogId');
    if (!storedCatalogId) {
      router.push('/channel/catalog/my');
    } else {
      setCatalogId(storedCatalogId);
    }
  }, [router]);

  // Função para voltar à tela anterior
  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my/shipping');
  }, [router]);

  // Detecta se o dispositivo é mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    // Se desejar atualizar quando houver resize, descomente:
    // window.addEventListener('resize', checkIsMobile);
    // return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Busca ou cria um pickup com base no catalogId utilizando o endpoint getPickupByCatalogId
  useEffect(() => {
    if (!catalogId) return;

    const fetchOrCreatePickup = async () => {
      setLoading(true);
      try {
        // Tenta buscar o pickup pelo catalogId
        const existingPickup = await getPickupByCatalogId(catalogId);
        setPickup(existingPickup);
        setFormValues({
          active: existingPickup.active,
          prazoRetirada: existingPickup.prazoRetirada,
          precoRetirada: existingPickup.precoRetirada,
        });
      } catch (error: any) {
        console.error('Pickup não encontrada, criando novo. Erro:', error);
        // Se não encontrar, cria um novo pickup com valores padrão
        try {
          const newPickupData = {
            catalogId,
            active: false,
            prazoRetirada: 0,
            precoRetirada: 0,
          };
          const createdPickup = await createPickup(newPickupData);
          setPickup(createdPickup);
          setFormValues({
            active: createdPickup.active,
            prazoRetirada: createdPickup.prazoRetirada,
            precoRetirada: createdPickup.precoRetirada,
          });
        } catch (createError) {
          console.error('Erro ao criar pickup:', createError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreatePickup();
  }, [catalogId]);

  // Atualiza os valores do formulário conforme o usuário interage
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };

  // Atualiza o pickup via API
  const handleUpdate = async () => {
    if (!pickup) return;
    setLoading(true);
    try {
      const updated = await updatePickup(pickup.id, {
        catalogId: pickup.catalogId,
        active: formValues.active,
        prazoRetirada: formValues.prazoRetirada,
        precoRetirada: formValues.precoRetirada,
      });
      setPickup(updated);
      alert('Pickup atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar pickup:', error);
      alert('Erro ao atualizar pickup.');
    } finally {
      setLoading(false);
    }
  };

  // Exclui o pickup via API
  const handleDelete = async () => {
    if (!pickup) return;
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este pickup?');
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deletePickup(pickup.id);
      alert('Pickup excluído com sucesso!');
      setPickup(null);
      // Opcional: redirecionar após exclusão:
      // router.push('/channel/catalog/my/shipping');
    } catch (error) {
      console.error('Erro ao excluir pickup:', error);
      alert('Erro ao excluir pickup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pickupPage}>
      {isMobile && (
        <MobileHeader 
          title="Retirar" 
          buttons={{ close: true }} 
          handleBack={handleBack} 
        />
      )}

      {loading && <LoadingSpinner />}

      <div className={styles.pickupContainer}>
        <SubHeader title="Retirar" handleBack={handleBack} />
        <div className={styles.pickup}>
          {pickup ? (
            <div>
              <div>
                <label>
                  Ativo:
                  <input
                    type="checkbox"
                    name="active"
                    checked={formValues.active}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div>
                <label>
                  Prazo de Retirada:
                  <input
                    type="number"
                    name="prazoRetirada"
                    value={formValues.prazoRetirada}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div>
                <label>
                  Preço de Retirada:
                  <input
                    type="number"
                    name="precoRetirada"
                    value={formValues.precoRetirada}
                    onChange={handleChange}
                    step="0.01"
                  />
                </label>
              </div>
              <div className={styles.buttons}>
                <button onClick={handleUpdate}>Salvar</button>
                <button onClick={handleDelete}>Excluir</button>
              </div>
            </div>
          ) : (
            <p>Nenhum pickup encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Pickup);
