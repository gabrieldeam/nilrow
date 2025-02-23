import api from '../api';
import { ProductDTO, ProductTemplateDTO } from '../../types/services/product';
import { PagedResponse } from '../../types/services/common';

// Criar Produto
export const createProduct = async (product: ProductDTO, images?: File[]) => {
  const formData = new FormData();
  formData.append("product", JSON.stringify(product));

  if (images) {
    images.forEach((image) => {
      formData.append("images", image);
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
  formData.append("product", JSON.stringify(product));

  if (images) {
    images.forEach((image) => {
      formData.append("images", image);
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
export const searchProducts = async (cep: string, name: string, page = 0, size = 10) => {
  const response = await api.get<PagedResponse<ProductDTO>>(`/products/search`, {
    params: { cep, name, page, size },
  });
  return response.data;
};

// Buscar Produtos pelo CEP (Paginação)
export const searchProductsByCep = async (cep: string, page = 0, size = 10) => {
  const response = await api.get<PagedResponse<ProductDTO>>(`/products/products`, {
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
  const response = await api.get<PagedResponse<ProductDTO>>(`/products/products-by-filters`, {
    params: { cep, categoryId, subCategoryId, page, size },
  });
  return response.data;
};

// Criar Template de Produto
export const createProductTemplate = async (template: Omit<ProductTemplateDTO, 'id'>) => {
  const response = await api.post<ProductTemplateDTO>('/product-templates/create', template, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};





// Atualizar Template de Produto
export const updateProductTemplate = async (id: string, template: ProductTemplateDTO) => {
  const response = await api.put<ProductTemplateDTO>(`/product-templates/edit/${id}`, template);
  return response.data;
};

// Deletar Template de Produto
export const deleteProductTemplate = async (id: string) => {
  await api.delete(`/product-templates/delete/${id}`);
};

// Obter Template por ID
export const getProductTemplateById = async (id: string) => {
  const response = await api.get<ProductTemplateDTO>(`/product-templates/${id}`);
  return response.data;
};

// Listar Todos os Templates de Produtos
export const getAllProductTemplates = async () => {
  const response = await api.get<ProductTemplateDTO[]>('/product-templates/all');
  return response.data;
};

// Buscar Produtos por Template e CEP
export const getProductsByTemplateAndCep = async (templateId: string, cep: string) => {
  const response = await api.get<ProductDTO[]>(`/product-templates/${templateId}/products-by-cep`, {
    params: { cep },
  });
  return response.data;
};

// Buscar Produtos por Template, CEP e Horário de Funcionamento
export const getProductsByTemplateAndCepAndHours = async (templateId: string, cep: string) => {
  const response = await api.get<ProductDTO[]>(`/product-templates/${templateId}/products-by-cep-and-hours`, {
    params: { cep },
  });
  return response.data;
};

// Buscar Templates de Produtos por Nome (Paginação)
export const searchProductTemplates = async (name: string, page = 0, size = 10) => {
  const response = await api.get<PagedResponse<ProductTemplateDTO>>(`/product-templates/search`, {
    params: { name, page, size },
  });
  return response.data;
};

// Buscar Templates de Produtos com Filtros
export const searchProductTemplatesWithFilters = async (
  name: string,
  cep?: string,
  page = 0,
  size = 10
) => {
  const response = await api.get<PagedResponse<ProductTemplateDTO>>(`/product-templates/search-with-filters`, {
    params: { name, cep, page, size },
  });
  return response.data;
};

// Buscar Produtos por Template e Filtros
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
