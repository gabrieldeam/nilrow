import api from '../api';
import { ProductDTO } from '../../types/services/product';
import { PagedResponse } from '../../types/services/common';

// Criar Produto
export const createProduct = async (product: ProductDTO, images?: File[]) => {
  const formData = new FormData();
  formData.append(
    'product',
    new Blob([JSON.stringify(product)], { type: 'application/json' })
  );

  if (images) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }

  const response = await api.post<ProductDTO>('/products/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// Atualizar Produto
export const updateProduct = async (id: string, product: ProductDTO, images?: File[]) => {
  const formData = new FormData();
  formData.append(
    'product',
    new Blob([JSON.stringify(product)], { type: 'application/json' })
  );

  if (images) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }

  const response = await api.put<ProductDTO>(`/products/edit/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// Deletar Produto
export const deleteProduct = async (id: string) => {
  await api.delete(`/products/delete/${id}`);
};

// Obter Produto por ID
export const getProductById = async (id: string) => {
  const response = await api.get<ProductDTO>(`/products/${id}`);
  return response.data;
};

// Obter Produtos por Catálogo
export const getProductsByCatalog = async (catalogId: string) => {
  const response = await api.get<ProductDTO[]>(`/products/catalog/${catalogId}`);
  return response.data;
};

// Pesquisar Produtos por CEP e Nome (Paginação)
// Observação: se o back-end retorna Page<Product> em vez de Page<ProductDTO>,
// há um conflito de tipos. Ajuste conforme a decisão (ver Opção A ou B).
export const searchProducts = async (cep: string, name: string, page = 0, size = 10) => {
  const response = await api.get<PagedResponse<ProductDTO>>('/products/search', {
    params: { cep, name, page, size },
  });
  return response.data;
};

// Buscar Produtos pelo CEP (Paginação)
export const searchProductsByCep = async (cep: string, page = 0, size = 10) => {
  const response = await api.get<PagedResponse<ProductDTO>>('/products/products', {
    params: { cep, page, size },
  });
  return response.data;
};

// Buscar Produtos por Filtros
export const searchProductsByFilters = async (
  cep: string,
  categoryId?: string,
  subCategoryId?: string,
  page = 0,
  size = 10
) => {
  const response = await api.get<PagedResponse<ProductDTO>>('/products/products-by-filters', {
    params: { cep, categoryId, subCategoryId, page, size },
  });
  return response.data;
};
