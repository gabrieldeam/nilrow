// src/services/favoriteService.ts

import api from './api';
import { FavoriteFolderDTO } from '../types/services/favorites';

/**
 * Retorna todas as pastas de favoritos do usuário autenticado.
 */
export const listFavoriteFolders = async (): Promise<FavoriteFolderDTO[]> => {
  const response = await api.get<FavoriteFolderDTO[]>('/favorites');
  return response.data;
};

/**
 * Retorna os IDs dos produtos de uma pasta de favoritos específica.
 * @param folderName Nome da pasta
 */
export const getProductsInFavoriteFolder = async (folderName: string): Promise<string[]> => {
  const response = await api.get<string[]>(`/favorites/${folderName}`);
  return response.data;
};

/**
 * Adiciona (curte) um produto à pasta de favoritos.
 * Se folderName não for informado, o backend usará o nome padrão ("todos").
 * @param productId ID do produto a ser curtido
 * @param folderName Nome da pasta (opcional)
 */
export const likeProduct = async (productId: string, folderName?: string): Promise<void> => {
  await api.post('/favorites/like', null, {
    params: {
      productId,
      folderName
    }
  });
};

/**
 * Remove o curtir de um produto da pasta de favoritos.
 * @param productId ID do produto a ser removido
 * @param folderName Nome da pasta
 */
export const removeProductLike = async (productId: string, folderName: string): Promise<void> => {
  await api.delete('/favorites/like', {
    params: { productId, folderName }
  });
};
