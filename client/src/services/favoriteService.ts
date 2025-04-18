// src/services/favoriteService.ts
import api from './api';
import { FavoriteFolderDTO, FavoriteStatusDTO } from '../types/services/favorites';
import { ProductDTO } from '../types/services/product';
import { PagedResponse } from '../types/services/common';

/**
 * Retorna todas as pastas de favoritos do usuário autenticado.
 * Cada pasta já traz até 3 produtos em `productsPreview`.
 */
export const listFavoriteFolders = async (): Promise<FavoriteFolderDTO[]> => {
  const { data } = await api.get<FavoriteFolderDTO[]>('/favorites');
  return data;
};

/**
 * Retorna os produtos de uma pasta de favoritos, de forma paginada.
 * @param folderName Nome da pasta
 * @param page Número da página (0‑based). Default = 0
 * @param size Tamanho da página. Default = 12
 * @param sort Campo para ordenar. Default = 'name'
 */
export const getProductsInFavoriteFolder = async (
  folderName: string,
  page = 0,
  size = 12,
  sort = 'name'
): Promise<PagedResponse<ProductDTO>> => {
  const { data } = await api.get<PagedResponse<ProductDTO>>(
    `/favorites/${encodeURIComponent(folderName)}`,
    {
      params: { page, size, sort }
    }
  );
  return data;
};

/**
 * Adiciona (curte) um produto à pasta de favoritos.
 */
export const likeProduct = async (
  productId: string,
  folderName?: string
): Promise<void> => {
  await api.post('/favorites/like', null, {
    params: { productId, folderName }
  });
};

/**
 * Remove o curtir de um produto da pasta de favoritos.
 */
export const removeProductLike = async (
  productId: string,
  folderName: string
): Promise<void> => {
  await api.delete('/favorites/like', {
    params: { productId, folderName }
  });
};


export const getFavoriteStatus = async (productId: string)
  : Promise<FavoriteStatusDTO> => {
  const { data } = await api.get<FavoriteStatusDTO>(
    '/favorites/status', { params: { productId } }
  );
  return data;
};