import api from '../api';
import { ProductDTO } from '../../types/services/product';
import { PagedResponse } from '../../types/services/common';

// Criar Produto
export const createProduct = async (
  product: ProductDTO,
  productImages?: File[],
  variationImages?: Record<number, File[]>
): Promise<ProductDTO> => {
  const formData = new FormData();

  // Agora sim, podemos enviar "product" como JSON no form-data:
  formData.append(
    'product',
    new Blob([JSON.stringify(product)], { type: 'application/json' })
  );

  if (productImages) {
    productImages.forEach((file) => {
      // "productImages" agora é @RequestPart(value = "productImages")
      formData.append('productImages', file);
    });
  }

  if (variationImages) {
    Object.keys(variationImages).forEach((key) => {
      const index = key;
      variationImages[Number(key)].forEach((file) => {
        // "variationImages" agora é @RequestPart(required = false)
        formData.append(`variationImages[${index}]`, file);
      });
    });
  }

  const response = await api.post<ProductDTO>('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};


// Atualizar Produto
export const updateProduct = async (
  id: string,
  product: ProductDTO,
  productImages?: File[],
  variationImages?: Record<number, File[]>
): Promise<ProductDTO> => {
  const formData = new FormData();
  formData.append(
    'product',
    new Blob([JSON.stringify(product)], { type: 'application/json' })
  );
  if (productImages) {
    productImages.forEach((file) => {
      formData.append('productImages', file);
    });
  }
  if (variationImages) {
    Object.keys(variationImages).forEach((key) => {
      const index = key;
      variationImages[Number(key)].forEach((file) => {
        formData.append(`variationImages[${index}]`, file);
      });
    });
  }
  const response = await api.put<ProductDTO>(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Deletar Produto
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

// Obter Produto por ID
export const getProductById = async (id: string): Promise<ProductDTO> => {
  const response = await api.get<ProductDTO>(`/products/${id}`);
  return response.data;
};

// Obter Produtos por Catálogo (paginado)
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

// Listar Todos os Produtos (paginado)
export const listAllProducts = async (
  page = 0,
  size = 10
): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>(`/products?page=${page}&size=${size}`);
  return response.data;
};