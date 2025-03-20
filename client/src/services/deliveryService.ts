import api from './api';
import { DeliveryDTO, DeliveryRadiusDTO, DeliveryPriceDTO} from '../types/services/delivery';

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

// Função para adicionar um novo raio ao delivery
export const addDeliveryRadius = async (
  deliveryId: string,
  radius: DeliveryRadiusDTO
): Promise<DeliveryDTO> => {
  const response = await api.post<DeliveryDTO>(`/deliveries/${deliveryId}/radii`, radius);
  return response.data;
};

// Função para atualizar um raio existente do delivery
export const updateDeliveryRadius = async (
  deliveryId: string,
  radiusId: string,
  radius: DeliveryRadiusDTO
): Promise<DeliveryDTO> => {
  // Garante que o DTO possua o mesmo id do path, se necessário
  radius.id = radiusId;
  const response = await api.put<DeliveryDTO>(`/deliveries/${deliveryId}/radii/${radiusId}`, radius);
  return response.data;
};

// Função para excluir um raio do delivery
export const deleteDeliveryRadius = async (
  deliveryId: string,
  radiusId: string
): Promise<DeliveryDTO> => {
  const response = await api.delete<DeliveryDTO>(`/deliveries/${deliveryId}/radii/${radiusId}`);
  return response.data;
};

export const getDeliveryPrice = async (
  catalogId: string,
  lat: number,
  lon: number
): Promise<DeliveryPriceDTO> => {
  const response = await api.get<DeliveryPriceDTO>(`/deliveries/${catalogId}/price?lat=${lat}&lon=${lon}`);
  return response.data;
};