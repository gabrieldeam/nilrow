import api from '../api';
import { ProductDTO, VariationImageDTO  } from '@/types/services/product';
import { PagedResponse } from '@/types/services/common';

/**
 * Cria um produto (POST /products).
 * Agora sem envio de imagens de variação.
 */
export const createProduct = async (
  product: ProductDTO,
  productImages?: File[]
): Promise<ProductDTO> => {
  const formData = new FormData();

  // Adiciona o JSON do produto
  formData.append(
    'product',
    new Blob([JSON.stringify(product)], { type: 'application/json' })
  );

  // Imagens principais do produto
  if (productImages) {
    productImages.forEach((file) => {
      formData.append('productImages', file);
    });
  }

  console.log('--- FormData Entries (create) ---');
  for (const pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: ${(pair[1] as File).name}`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
  console.log('------------------------');

  const response = await api.post<ProductDTO>('/products', formData);
  return response.data;
};

/**
 * Atualiza um produto (PUT /products/{id})
 * Também sem envio de imagens de variação.
 */
export const updateProduct = async (
  id: string,
  product: ProductDTO,
  productImages?: File[]
): Promise<ProductDTO> => {
  const formData = new FormData();

  formData.append(
    'product',
    new Blob([JSON.stringify(product)], { type: 'application/json' })
  );

  // Imagens principais do produto
  if (productImages) {
    productImages.forEach((file) => {
      formData.append('productImages', file);
    });
  }

  console.log('--- FormData Entries (update) ---');
  for (const pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: ${(pair[1] as File).name}`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
  console.log('------------------------');

  const response = await api.put<ProductDTO>(`/products/${id}`, formData);
  return response.data;
};

/** Deletar um produto */
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

/** Obter produto por ID */
export const getProductById = async (id: string): Promise<ProductDTO> => {
  const response = await api.get<ProductDTO>(`/products/${id}`);
  return response.data;
};

/** Listar produtos de um catálogo, paginado */
export const getProductsByCatalog = async (
  catalogId: string,
  page = 0,
  size = 10
): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>(
    `/products/catalog/${catalogId}?page=${page}&size=${size}`
  );
  return response.data;
};

/** Listar todos os produtos, paginado */
export const listAllProducts = async (
  page = 0,
  size = 10
): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>(`/products?page=${page}&size=${size}`);
  return response.data;
};



/**
 * Cria uma nova imagem de variação (POST /variation-images), enviando como multipart/form-data.
 * 
 * @param variationId ID da variação.
 * @param imageFile Arquivo de imagem a enviar.
 * @param orderIndex (opcional) ordem da imagem.
 */
export const createVariationImage = async (
  variationId: string,
  imageFile: File,
  orderIndex?: number
): Promise<VariationImageDTO> => {
  const formData = new FormData();
  formData.append('variationId', variationId);
  formData.append('imageFile', imageFile);
  if (orderIndex !== undefined && orderIndex !== null) {
    formData.append('orderIndex', orderIndex.toString());
  }

  const response = await api.post<VariationImageDTO>('/variation-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Atualiza uma imagem de variação (PUT /variation-images/{id}), enviando como multipart/form-data.
 * 
 * @param id ID da VariationImage a atualizar.
 * @param imageFile novo arquivo se quiser trocar a imagem.
 * @param orderIndex nova ordem da imagem.
 */
export const updateVariationImage = async (
  id: string,
  imageFile?: File,
  orderIndex?: number
): Promise<VariationImageDTO> => {
  const formData = new FormData();
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  if (orderIndex !== undefined && orderIndex !== null) {
    formData.append('orderIndex', orderIndex.toString());
  }

  const response = await api.put<VariationImageDTO>(`/variation-images/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Busca uma imagem de variação pelo ID (GET /variation-images/{id}).
 */
export const getVariationImageById = async (id: string): Promise<VariationImageDTO> => {
  const response = await api.get<VariationImageDTO>(`/variation-images/${id}`);
  return response.data;
};

/**
 * Lista todas as imagens de uma variação (GET /variation-images/byVariation/{variationId}).
 */
export const listVariationImagesByVariation = async (
  variationId: string
): Promise<VariationImageDTO[]> => {
  const response = await api.get<VariationImageDTO[]>(`/variation-images/byVariation/${variationId}`);
  return response.data;
};

/**
 * Deleta uma imagem de variação (DELETE /variation-images/{id}).
 */
export const deleteVariationImage = async (id: string): Promise<void> => {
  await api.delete(`/variation-images/${id}`);
};

/** 
 * Pesquisa produtos pelo nome ou skuCode, ignorando maiúsculas/minúsculas, paginado.
 * 
 * @param term Termo de busca.
 * @param page Página (padrão 0).
 * @param size Quantidade de itens por página (padrão 10).
 */
export const searchProducts = async (
  term: string,
  page = 0,
  size = 10
): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>(
    `/products/search?term=${encodeURIComponent(term)}&page=${page}&size=${size}`
  );
  return response.data;
};


/**
 * Pesquisa produtos pelo nome ou skuCode de um catálogo específico, paginado.
 *
 * @param catalogId ID do catálogo
 * @param term Termo de busca.
 * @param page Página (padrão 0).
 * @param size Quantidade de itens por página (padrão 10).
 */
export const searchProductsByCatalog = async (
  catalogId: string,
  term: string,
  page = 0,
  size = 10
): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>(
    `/products/catalog/${catalogId}/search?term=${encodeURIComponent(term)}&page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * Lista produtos de um catálogo filtrados pelo endereço de entrega (latitude e longitude),
 * considerando a regra de entrega (ponto permitido em pelo menos uma Location) e estoque > 0.
 *
 * @param catalogId ID do catálogo.
 * @param latitude Latitude do endereço de entrega.
 * @param longitude Longitude do endereço de entrega.
 * @param page Página (padrão 0).
 * @param size Quantidade de itens por página (padrão 10).
 */
export const filterProductsByCatalogAndDelivery = async (
  catalogId: string,
  latitude: number,
  longitude: number,
  page = 0,
  size = 10
): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>(
    `/products/catalog/${catalogId}/filter?latitude=${latitude}&longitude=${longitude}&page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * Obter produto por ID com verificação de entrega e funcionamento (GET /products/{id}/delivery).
 * 
 * @param id ID do produto.
 * @param latitude Latitude do endereço de entrega.
 * @param longitude Longitude do endereço de entrega.
 * @returns Promise<ProductDTO> com o campo `deliveryMessage` preenchido conforme a regra de negócio.
 */
export const getProductByIdWithDelivery = async (
  id: string,
  latitude: number,
  longitude: number
): Promise<ProductDTO> => {
  const response = await api.get<ProductDTO>(`/products/${id}/delivery`, {
    params: { 
      latitude,
      longitude
    }
  });
  return response.data;
};


/**
 * Lista produtos de um catálogo filtrados por subcategoria e endereço de entrega (latitude e longitude),
 * considerando a regra de entrega (ponto permitido em pelo menos uma Location) e estoque > 0.
 *
 * @param catalogId ID do catálogo.
 * @param subcategoryId ID da subcategoria.
 * @param latitude Latitude do endereço de entrega.
 * @param longitude Longitude do endereço de entrega.
 * @param page Página (padrão 0).
 * @param size Quantidade de itens por página (padrão 10).
 * @returns Promise<PagedResponse<ProductDTO>>
 */
export const getProductsByCatalogAndSubcategoryWithDelivery = async (
  catalogId: string,
  subcategoryId: string,
  latitude: number,
  longitude: number,
  page = 0,
  size = 10
): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>(
    `/products/catalog/${catalogId}/subcategory/${subcategoryId}/delivery?latitude=${latitude}&longitude=${longitude}&page=${page}&size=${size}`
  );
  return response.data;
};

