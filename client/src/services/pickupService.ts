import api from './api';
import { PickupDTO, PickupActiveDetailsDTO } from '@/types/services/pickup';

// Busca todos os pickups
export const getAllPickups = async (): Promise<PickupDTO[]> => {
  const response = await api.get('/pickups');
  return response.data;
};

// Busca um pickup pelo id
export const getPickupById = async (id: string): Promise<PickupDTO> => {
  const response = await api.get(`/pickups/${id}`);
  return response.data;
};

// Cria um novo pickup
// Usamos Omit para que o id não seja obrigatório na criação
export const createPickup = async (pickup: Omit<PickupDTO, 'id'>): Promise<PickupDTO> => {
  const response = await api.post('/pickups', pickup);
  return response.data;
};

// Atualiza um pickup existente
export const updatePickup = async (id: string, pickup: Omit<PickupDTO, 'id'>): Promise<PickupDTO> => {
  const response = await api.put(`/pickups/${id}`, pickup);
  return response.data;
};

// Exclui um pickup
export const deletePickup = async (id: string): Promise<void> => {
  await api.delete(`/pickups/${id}`);
};

// Novo endpoint: Busca pickup pelo catalogId
export const getPickupByCatalogId = async (catalogId: string): Promise<PickupDTO> => {
  const response = await api.get(`/pickups/catalog/${catalogId}`);
  return response.data;
};

// Novo endpoint: Busca detalhes ativos do pickup pelo catalogId,
// retornando prazo, preço e informações completas do endereço do catálogo
export const getActivePickupDetailsByCatalogId = async (catalogId: string): Promise<PickupActiveDetailsDTO> => {
  const response = await api.get(`/pickups/catalog/${catalogId}/active-details`);
  return response.data;
};

// Retorna o valor do campo active ou null se não houver pickup para o catálogo.
export const getActiveByCatalog = async (catalogId: string): Promise<boolean | null> => {
  const response = await api.get(`/pickups/catalog/${catalogId}/active`);
  return response.data;
};