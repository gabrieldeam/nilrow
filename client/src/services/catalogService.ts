import api from './api';
import { CatalogDTO, CatalogData, AddressData, LocationData } from '../types/services/catalog';

// Criação de catálogo
export const createCatalog = async (catalogDTO: CatalogDTO) => {
  const response = await api.post<CatalogData>('/catalog/create', catalogDTO);
  return response.data;
};

// Busca catálogos visíveis
export const getVisibleCatalogs = async () => {
  const response = await api.get<CatalogData[]>('/catalog/visible');
  return response.data;
};

// Busca catálogos ocultos
export const getHiddenCatalogs = async () => {
  const response = await api.get<CatalogData[]>('/catalog/hidden');
  return response.data;
};

// Atualiza visibilidade do catálogo
export const updateCatalogVisibility = async (id: string, visible: boolean) => {
  await api.patch(`/catalog/visibility/${id}`, null, {
    params: { visible },
  });
};
