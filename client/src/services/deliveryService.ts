import api from './api';
import { DeliveryDTO } from '../types/services/delivery';

// Função para criar um novo delivery
export const createDelivery = async (delivery: DeliveryDTO): Promise<DeliveryDTO> => {
  const response = await api.post<DeliveryDTO>('/api/deliveries', delivery);
  return response.data;
};

// Função para atualizar um delivery existente
export const updateDelivery = async (id: string, delivery: DeliveryDTO): Promise<DeliveryDTO> => {
  const response = await api.put<DeliveryDTO>(`/api/deliveries/${id}`, delivery);
  return response.data;
};

// Função para buscar um delivery por id
export const getDeliveryById = async (id: string): Promise<DeliveryDTO> => {
  const response = await api.get<DeliveryDTO>(`/api/deliveries/${id}`);
  return response.data;
};

// Função para buscar todos os deliveries
export const getAllDeliveries = async (): Promise<DeliveryDTO[]> => {
  const response = await api.get<DeliveryDTO[]>('/api/deliveries');
  return response.data;
};

// Função para excluir um delivery
export const deleteDelivery = async (id: string): Promise<void> => {
  await api.delete(`/api/deliveries/${id}`);
};

