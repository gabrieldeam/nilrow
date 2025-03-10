import api from '../api';
import { ProductTemplateDTO, VariationTemplateImageDTO } from '@/types/services/productTemplate';
import { PagedResponse } from '@/types/services/common';

/**
 * Cria um template de produto (POST /products_templates)
 * Envia JSON e imagens via multipart/form-data.
 */
export const createProductTemplate = async (
  template: ProductTemplateDTO,
  productImages?: File[]
): Promise<ProductTemplateDTO> => {
  const formData = new FormData();

  // Adiciona o JSON do template
  formData.append(
    'product',
    new Blob([JSON.stringify(template)], { type: 'application/json' })
  );

  // Adiciona as imagens principais do template
  if (productImages) {
    productImages.forEach((file) => {
      formData.append('productImages', file);
    });
  }

  console.log('--- FormData Entries (createProductTemplate) ---');
  for (const pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: ${(pair[1] as File).name}`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
  console.log('------------------------');

  const response = await api.post<ProductTemplateDTO>('/products_templates', formData);
  return response.data;
};

/**
 * Atualiza um template de produto (PUT /products_templates/{id})
 * Envia JSON e imagens via multipart/form-data.
 */
export const updateProductTemplate = async (
  id: string,
  template: ProductTemplateDTO,
  productImages?: File[]
): Promise<ProductTemplateDTO> => {
  const formData = new FormData();

  // Adiciona o JSON do template
  formData.append(
    'product',
    new Blob([JSON.stringify(template)], { type: 'application/json' })
  );

  // Adiciona as imagens principais do template
  if (productImages) {
    productImages.forEach((file) => {
      formData.append('productImages', file);
    });
  }

  console.log('--- FormData Entries (updateProductTemplate) ---');
  for (const pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: ${(pair[1] as File).name}`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
  console.log('------------------------');

  const response = await api.put<ProductTemplateDTO>(`/products_templates/${id}`, formData);
  return response.data;
};

/**
 * Deleta um template de produto (DELETE /products_templates/{id})
 */
export const deleteProductTemplate = async (id: string): Promise<void> => {
  await api.delete(`/products_templates/${id}`);
};

/**
 * Obtém um template de produto pelo ID (GET /products_templates/{id})
 */
export const getProductTemplateById = async (id: string): Promise<ProductTemplateDTO> => {
  const response = await api.get<ProductTemplateDTO>(`/products_templates/${id}`);
  return response.data;
};

/**
 * Lista todos os templates de produto, paginados (GET /products_templates)
 */
export const listAllProductTemplates = async (
  page = 0,
  size = 10
): Promise<PagedResponse<ProductTemplateDTO>> => {
  const response = await api.get<PagedResponse<ProductTemplateDTO>>(
    `/products_templates?page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * Busca templates de produto por termo (GET /products_templates/search)
 */
export const searchProductTemplates = async (
  term: string,
  page = 0,
  size = 10
): Promise<PagedResponse<ProductTemplateDTO>> => {
  const response = await api.get<PagedResponse<ProductTemplateDTO>>(
    `/products_templates/search?term=${encodeURIComponent(term)}&page=${page}&size=${size}`
  );
  return response.data;
};




/**
 * Cria uma nova imagem de variação (POST /variation-template-images)
 * Envia os dados via multipart/form-data.
 *
 * @param variationId ID da variação.
 * @param imageFile Arquivo de imagem a ser enviado.
 * @param orderIndex (opcional) Ordem da imagem.
 */
export const createVariationTemplateImage = async (
  variationId: string,
  imageFile: File,
  orderIndex?: number
): Promise<VariationTemplateImageDTO> => {
  const formData = new FormData();
  formData.append('variationId', variationId);
  formData.append('imageFile', imageFile);
  if (orderIndex !== undefined && orderIndex !== null) {
    formData.append('orderIndex', orderIndex.toString());
  }

  const response = await api.post<VariationTemplateImageDTO>('/variation-template-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Atualiza uma imagem de variação (PUT /variation-template-images/{id})
 * Envia os dados via multipart/form-data.
 *
 * @param id ID da imagem de variação a ser atualizada.
 * @param imageFile (opcional) Novo arquivo de imagem.
 * @param orderIndex (opcional) Nova ordem da imagem.
 */
export const updateVariationTemplateImage = async (
  id: string,
  imageFile?: File,
  orderIndex?: number
): Promise<VariationTemplateImageDTO> => {
  const formData = new FormData();
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  if (orderIndex !== undefined && orderIndex !== null) {
    formData.append('orderIndex', orderIndex.toString());
  }

  const response = await api.put<VariationTemplateImageDTO>(`/variation-template-images/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Busca uma imagem de variação pelo ID (GET /variation-template-images/{id}).
 *
 * @param id ID da imagem.
 */
export const getVariationTemplateImageById = async (
  id: string
): Promise<VariationTemplateImageDTO> => {
  const response = await api.get<VariationTemplateImageDTO>(`/variation-template-images/${id}`);
  return response.data;
};

/**
 * Lista todas as imagens de uma variação (GET /variation-template-images/byVariation/{variationId}).
 *
 * @param variationId ID da variação.
 */
export const listVariationTemplateImagesByVariation = async (
  variationId: string
): Promise<VariationTemplateImageDTO[]> => {
  const response = await api.get<VariationTemplateImageDTO[]>(`/variation-template-images/byVariation/${variationId}`);
  return response.data;
};

/**
 * Deleta uma imagem de variação (DELETE /variation-template-images/{id}).
 *
 * @param id ID da imagem a ser deletada.
 */
export const deleteVariationTemplateImage = async (id: string): Promise<void> => {
  await api.delete(`/variation-template-images/${id}`);
};