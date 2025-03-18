import api from './api';
import { DeliveryDTO, DeliveryRadiusDTO } from '../types/services/delivery';

// Função para criar um novo delivery
export const createDelivery = async (delivery: DeliveryDTO): Promise<DeliveryDTO> => {
  const response = await api.post<DeliveryDTO>('/deliveries', delivery);
  return response.data;
};

// Função para atualizar um delivery existente
export const updateDelivery = async (id: string, delivery: DeliveryDTO): Promise<DeliveryDTO> => {
  const response = await api.put<DeliveryDTO>(`/deliveries/${id}`, delivery);
  return response.data;
};

// Função para buscar um delivery por id
export const getDeliveryById = async (id: string): Promise<DeliveryDTO> => {
  const response = await api.get<DeliveryDTO>(`/deliveries/${id}`);
  return response.data;
};

// Função para buscar todos os deliveries
export const getAllDeliveries = async (): Promise<DeliveryDTO[]> => {
  const response = await api.get<DeliveryDTO[]>('/deliveries');
  return response.data;
};

// Função para excluir um delivery
export const deleteDelivery = async (id: string): Promise<void> => {
  await api.delete(`/deliveries/${id}`);
};

// (Novo) Busca delivery pelo catalogId
export const getDeliveryByCatalogId = async (catalogId: string): Promise<DeliveryDTO | null> => {
  try {
    const response = await api.get<DeliveryDTO>(`/deliveries/catalog/${catalogId}`);
    return response.data;
  } catch (error) {
    // Se não existir, pode retornar null
    return null;
  }
};

// Função para atualizar os radii e coordenadas de um delivery
export const updateDeliveryRadii = async (deliveryId: string, radii: DeliveryRadiusDTO[]): Promise<DeliveryDTO> => {
  const response = await api.put<DeliveryDTO>(`/deliveries/${deliveryId}/radii`, radii);
  return response.data;
};

