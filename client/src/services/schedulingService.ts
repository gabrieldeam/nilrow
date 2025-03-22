// src/services/schedulingService.ts

import api from './api'; // sua instância configurada (axios ou fetch)
import { SchedulingDTO } from '@/types/services/scheduling';

/**
 * Cria um Scheduling no backend (POST).
 * Não há mais limitação de um scheduling por ShippingMode,
 * então não é mais "createOrUpdate" necessariamente – a não ser que o backend
 * mantenha essa lógica de "upsert". Ajuste conforme sua API real.
 */
export const createScheduling = async (
  scheduling: Omit<SchedulingDTO, 'id'>
): Promise<SchedulingDTO> => {
  const response = await api.post('/schedulings', scheduling);
  return response.data;
};

/**
 * Atualiza explicitamente um Scheduling pelo ID (PUT).
 */
export const updateScheduling = async (
  id: string,
  scheduling: Partial<SchedulingDTO>
): Promise<SchedulingDTO> => {
  const response = await api.put(`/schedulings/${id}`, scheduling);
  return response.data;
};

/**
 * Busca um Scheduling pelo ID (GET).
 */
export const getSchedulingById = async (id: string): Promise<SchedulingDTO> => {
  const response = await api.get(`/schedulings/${id}`);
  return response.data;
};

/**
 * Lista todos os Schedulings de um catálogo (GET).
 */
export const getSchedulingsByCatalogId = async (
  catalogId: string
): Promise<SchedulingDTO[]> => {
  const response = await api.get(`/schedulings/catalog/${catalogId}`);
  return response.data;
};

/**
 * Exclui um Scheduling pelo ID (DELETE).
 */
export const deleteScheduling = async (id: string): Promise<void> => {
  await api.delete(`/schedulings/${id}`);
};
