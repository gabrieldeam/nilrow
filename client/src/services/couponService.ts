import api from './api';
import {
  CouponDTO,
  CouponRadiusDTO,
  CouponAvailabilityDTO,
} from '../types/services/coupon';

/* ---------- CRUD principal ---------- */

// Criar
export const createCoupon = async (data: CouponDTO): Promise<CouponDTO> => {
  const res = await api.post<CouponDTO>('/coupons', data);
  return res.data;
};

// Atualizar
export const updateCoupon = async (
  id: string,
  data: CouponDTO,
): Promise<CouponDTO> => {
  const res = await api.put<CouponDTO>(`/coupons/${id}`, data);
  return res.data;
};

// Buscar por id
export const getCouponById = async (id: string): Promise<CouponDTO> => {
  const res = await api.get<CouponDTO>(`/coupons/${id}`);
  return res.data;
};

// Buscar todos
export const getAllCoupons = async (): Promise<CouponDTO[]> => {
  const res = await api.get<CouponDTO[]>('/coupons');
  return res.data;
};

// Excluir
export const deleteCoupon = async (id: string): Promise<void> => {
  await api.delete(`/coupons/${id}`);
};

/* ---------- Por código + catálogo ---------- */

export const getCouponByCode = async (
  catalogId: string,
  code: string,
): Promise<CouponDTO | null> => {
  try {
    const res = await api.get<CouponDTO>(
      `/coupons/catalog/${catalogId}/code/${code}`,
    );
    return res.data;
  } catch {
    return null; // não encontrado
  }
};

/* ---------- Checar elegibilidade ---------- */

export interface CheckCouponParams {
  userId: string;
  cartTotal: number;
  lat: number;
  lon: number;
  productId?: string;
  categoryId?: string;
  subCategoryId?: string;
}

export const checkCoupon = async (
  catalogId: string,
  code: string,
  params: CheckCouponParams,
): Promise<CouponAvailabilityDTO> => {
  const res = await api.get<CouponAvailabilityDTO>(
    `/coupons/check/${catalogId}/${code}`,
    { params },
  );
  return res.data;
};

// Saber apenas se está ativo
export const isCouponActive = async (
  catalogId: string,
  code: string,
): Promise<boolean | null> => {
  try {
    const res = await api.get<boolean>(
      `/coupons/catalog/${catalogId}/code/${code}/active`,
    );
    return res.data;
  } catch {
    return null;
  }
};

/* ---------- Raio (radii) ---------- */

// Adicionar
export const addCouponRadius = async (
  couponId: string,
  radius: CouponRadiusDTO,
): Promise<CouponDTO> => {
  const res = await api.post<CouponDTO>(`/coupons/${couponId}/radii`, radius);
  return res.data;
};

// Atualizar
export const updateCouponRadius = async (
  couponId: string,
  radiusId: string,
  radius: CouponRadiusDTO,
): Promise<CouponDTO> => {
  radius.id = radiusId;
  const res = await api.put<CouponDTO>(
    `/coupons/${couponId}/radii/${radiusId}`,
    radius,
  );
  return res.data;
};

// Excluir
export const deleteCouponRadius = async (
  couponId: string,
  radiusId: string,
): Promise<CouponDTO> => {
  const res = await api.delete<CouponDTO>(
    `/coupons/${couponId}/radii/${radiusId}`,
  );
  return res.data;
};
