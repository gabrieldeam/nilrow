import api from './api';
import {
  FreeShippingDTO,
  FreeShippingRadiusDTO,
  FreeShippingAvailabilityDTO,
} from '../types/services/freeshipping';

/* ---------- CRUD principal ---------- */

// Criar
export const createFreeShipping = async (
  data: FreeShippingDTO,
): Promise<FreeShippingDTO> => {
  const res = await api.post<FreeShippingDTO>('/free-shippings', data);
  return res.data;
};

// Atualizar
export const updateFreeShipping = async (
  id: string,
  data: FreeShippingDTO,
): Promise<FreeShippingDTO> => {
  const res = await api.put<FreeShippingDTO>(`/free-shippings/${id}`, data);
  return res.data;
};

// Buscar por id
export const getFreeShippingById = async (id: string): Promise<FreeShippingDTO> => {
  const res = await api.get<FreeShippingDTO>(`/free-shippings/${id}`);
  return res.data;
};

// Buscar todos
export const getAllFreeShippings = async (): Promise<FreeShippingDTO[]> => {
  const res = await api.get<FreeShippingDTO[]>('/free-shippings');
  return res.data;
};

// Excluir
export const deleteFreeShipping = async (id: string): Promise<void> => {
  await api.delete(`/free-shippings/${id}`);
};

/* ---------- Ações por Catálogo ---------- */

// Trazer config de frete grátis pelo catalogId
export const getFreeShippingByCatalogId = async (
  catalogId: string,
): Promise<FreeShippingDTO | null> => {
  try {
    const res = await api.get<FreeShippingDTO>(`/free-shippings/catalog/${catalogId}`);
    return res.data;
  } catch {
    return null; // não configurado
  }
};

// Verificar se há frete grátis disponível
export const checkFreeShipping = async (
  catalogId: string,
  cartTotal: number,
  lat: number,
  lon: number,
): Promise<FreeShippingAvailabilityDTO> => {
  const res = await api.get<FreeShippingAvailabilityDTO>(
    `/free-shippings/${catalogId}/check`,
    { params: { cartTotal, lat, lon } },
  );
  return res.data;
};

// Saber apenas se está ativo
export const isFreeShippingActive = async (
  catalogId: string,
): Promise<boolean | null> => {
  try {
    const res = await api.get<boolean>(`/free-shippings/catalog/${catalogId}/active`);
    return res.data;
  } catch {
    return null; // não existe
  }
};

/* ---------- Raio (radii) ---------- */

// Adicionar
export const addFreeShippingRadius = async (
  freeShippingId: string,
  radius: FreeShippingRadiusDTO,
): Promise<FreeShippingDTO> => {
  const res = await api.post<FreeShippingDTO>(
    `/free-shippings/${freeShippingId}/radii`,
    radius,
  );
  return res.data;
};

// Atualizar (garante id no body)
export const updateFreeShippingRadius = async (
  freeShippingId: string,
  radiusId: string,
  radius: FreeShippingRadiusDTO,
): Promise<FreeShippingDTO> => {
  radius.id = radiusId;
  const res = await api.put<FreeShippingDTO>(
    `/free-shippings/${freeShippingId}/radii/${radiusId}`,
    radius,
  );
  return res.data;
};

// Excluir
export const deleteFreeShippingRadius = async (
  freeShippingId: string,
  radiusId: string,
): Promise<FreeShippingDTO> => {
  const res = await api.delete<FreeShippingDTO>(
    `/free-shippings/${freeShippingId}/radii/${radiusId}`,
  );
  return res.data;
};
