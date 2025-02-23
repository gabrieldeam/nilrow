import api from '../api';
import { BrandDTO, CreateBrandDTO } from '../../types/services/brand';
import { PagedResponse } from '../../types/services/common';

// Criar Marca
export const createBrand = async (brand: CreateBrandDTO): Promise<BrandDTO> => {
  const response = await api.post<BrandDTO>('/brands/create', brand);
  return response.data;
};

// Atualizar Marca
export const updateBrand = async (id: string, brand: BrandDTO): Promise<BrandDTO> => {
  const response = await api.put<BrandDTO>(`/brands/edit/${id}`, brand);
  return response.data;
};

// Deletar Marca
export const deleteBrand = async (id: string): Promise<void> => {
  await api.delete(`/brands/delete/${id}`);
};

// Obter Marca por ID
export const getBrandById = async (id: string): Promise<BrandDTO> => {
  const response = await api.get<BrandDTO>(`/brands/${id}`);
  return response.data;
};

// Obter Todas as Marcas
export const getAllBrands = async (
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<BrandDTO>> => {
  const response = await api.get<PagedResponse<BrandDTO>>('/brands/all', {
    params: { page, size }
  });
  return response.data;
};