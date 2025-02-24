import api from '../api';
import { AxiosError } from 'axios';
import { ProductTemplateDTO } from '../../types/services/productTemplate';
import { PagedResponse } from '../../types/services/common';
import { ProductDTO } from '../../types/services/product';

/**
 * Cria um Template de Produto usando multipart/form-data
 */
export async function createProductTemplate(
  template: Omit<ProductTemplateDTO, 'id'>,
  images?: File[],
) {
  console.log('[Front] createProductTemplate() called', { template, images });

  const formData = new FormData();
  // Importante usar Blob para que o Content-Type seja application/json
  // O JSON conterá os campos associados (associatedTemplateIds, productsId, etc.), se informados.
  formData.append(
    'template',
    new Blob([JSON.stringify(template)], { type: 'application/json' })
  );

  if (images && images.length > 0) {
    for (const file of images) {
      formData.append('images', file);
    }
  }

  try {
    const response = await api.post<ProductTemplateDTO>(
      '/product-templates/create',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // garante envio de cookie no cross-site
      }
    );
    console.log('[Front] createProductTemplate() response', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('[Front] createProductTemplate() error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error('[Front] createProductTemplate() unknown error:', error);
    }
    throw error; // re-lançamos para tratar em outro lugar se quiser
  }
}

/**
 * Atualiza um Template de Produto usando multipart/form-data
 */
export const updateProductTemplate = async (
  id: string,
  template: ProductTemplateDTO,
  images?: File[]
) => {
  console.log('[Front] updateProductTemplate() called', { id, template, images });

  const formData = new FormData();
  // O JSON gerado incluirá os campos de associação (associatedTemplateIds, productsId, etc.)
  formData.append(
    'template',
    new Blob([JSON.stringify(template)], { type: 'application/json' })
  );

  if (images && images.length > 0) {
    images.forEach((file) => formData.append('images', file));
  }

  try {
    const response = await api.put<ProductTemplateDTO>(
      `/product-templates/edit/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );
    console.log('[Front] updateProductTemplate() success, response=', response.data);
    return response.data;
  } catch (error) {
    console.error('[Front] updateProductTemplate() error details:', error);
    throw error;
  }
};

/**
 * Deleta um Template de Produto
 */
export const deleteProductTemplate = async (id: string) => {
  await api.delete(`/product-templates/delete/${id}`);
};

/**
 * Obtém Template por ID
 */
export const getProductTemplateById = async (id: string) => {
  const response = await api.get<ProductTemplateDTO>(`/product-templates/${id}`);
  return response.data;
};

/**
 * Lista Todos os Templates
 */
export const getAllProductTemplates = async () => {
  const response = await api.get<ProductTemplateDTO[]>('/product-templates/all');
  return response.data;
};

/**
 * Busca Templates paginados por nome
 */
export const searchProductTemplates = async (name: string, page = 0, size = 10) => {
  const response = await api.get<PagedResponse<ProductTemplateDTO>>('/product-templates/search', {
    params: { name, page, size },
  });
  return response.data;
};

/**
 * Obtém os produtos associados a um template
 * Endpoint: GET /product-templates/{id}/products
 */
export const getProductsByTemplate = async (id: string) => {
  const response = await api.get<ProductDTO[]>(`/product-templates/${id}/products`);
  return response.data;
};

/**
 * Obtém os produtos de um template filtrados pelo CEP
 * Endpoint: GET /product-templates/{templateId}/products-by-cep
 */
export const getProductsByTemplateAndCep = async (templateId: string, cep: string) => {
  const response = await api.get<ProductDTO[]>(`/product-templates/${templateId}/products-by-cep`, {
    params: { cep },
  });
  return response.data;
};

/**
 * Obtém os produtos de um template filtrados pelo CEP e horário de funcionamento
 * Endpoint: GET /product-templates/{templateId}/products-by-cep-and-hours
 */
export const getProductsByTemplateAndCepAndHours = async (templateId: string, cep: string) => {
  const response = await api.get<ProductDTO[]>(`/product-templates/${templateId}/products-by-cep-and-hours`, {
    params: { cep },
  });
  return response.data;
};

/**
 * Busca templates com filtros adicionais (nome e opcionalmente CEP)
 * Endpoint: GET /product-templates/search-with-filters
 */
export const searchTemplatesWithFilters = async (
  name: string,
  cep?: string,
  page = 0,
  size = 10
) => {
  const response = await api.get<PagedResponse<ProductTemplateDTO>>('/product-templates/search-with-filters', {
    params: { name, cep, page, size },
  });
  return response.data;
};

/**
 * Obtém os produtos de um template com filtros adicionais (CEP, categoria e subcategoria)
 * Endpoint: GET /product-templates/{templateId}/products-by-filters
 */
export const getProductsByTemplateAndFilters = async (
  templateId: string,
  cep: string,
  categoryId?: string,
  subCategoryId?: string,
  page = 0,
  size = 10
) => {
  const response = await api.get<PagedResponse<ProductDTO>>(`/product-templates/${templateId}/products-by-filters`, {
    params: { cep, categoryId, subCategoryId, page, size },
  });
  return response.data;
};
