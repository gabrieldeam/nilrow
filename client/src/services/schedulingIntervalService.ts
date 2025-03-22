import api from './api';
import { SchedulingIntervalDTO } from '@/types/services/scheduling';

/**
 * Cria um novo intervalo de agendamento (POST).
 */
export const createSchedulingInterval = async (
  interval: Omit<SchedulingIntervalDTO, 'id'>
): Promise<SchedulingIntervalDTO> => {
  const response = await api.post('/scheduling-intervals', interval);
  return response.data;
};

/**
 * Atualiza um intervalo de agendamento pelo ID (PUT).
 */
export const updateSchedulingInterval = async (
  id: string,
  interval: Partial<SchedulingIntervalDTO>
): Promise<SchedulingIntervalDTO> => {
  const response = await api.put(`/scheduling-intervals/${id}`, interval);
  return response.data;
};

/**
 * Busca um intervalo de agendamento pelo ID (GET).
 */
export const getSchedulingIntervalById = async (
  id: string
): Promise<SchedulingIntervalDTO> => {
  const response = await api.get(`/scheduling-intervals/${id}`);
  return response.data;
};

/**
 * Lista todos os intervalos de um Scheduling específico (GET).
 */
export const getSchedulingIntervalsBySchedulingId = async (
  schedulingId: string
): Promise<SchedulingIntervalDTO[]> => {
  const response = await api.get(`/scheduling-intervals/scheduling/${schedulingId}`);
  return response.data;
};

/**
 * Exclui um intervalo de agendamento pelo ID (DELETE).
 */
export const deleteSchedulingInterval = async (id: string): Promise<void> => {
  await api.delete(`/scheduling-intervals/${id}`);
};
