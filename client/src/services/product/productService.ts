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
      const files = variationImages[Number(key)];
      if (files && Array.isArray(files)) {
        files.forEach((file) => {
          // Aqui, a chave está sendo formada como "variationImages0", "variationImages1", etc.
          formData.append(`variationImages${key}`, file);
        });
      }
    });
  }

  // Log detalhado do FormData
  console.log('--- FormData Entries ---');
  for (const pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: ${pair[1].name}`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
  console.log('------------------------');

  const response = await api.post<ProductDTO>('/products', formData);
  return response.data;
};



export const updateProduct = async (
  id: string,
  product: ProductDTO,
  productImages?: File[],
  variationImages?: Record<number, File[]>
): Promise<ProductDTO> => {

  // Logs
  console.log('Dados do produto:', product);
  if (productImages) {
    console.log('Imagens do produto:', productImages.map((file) => file.name));
  }
  if (variationImages) {
    Object.keys(variationImages).forEach((key) => {
      const files = variationImages[+key]; 
      console.log(`Variação ${key} - arquivos:`, files?.map((file) => file.name));
    });
  }

  const formData = new FormData();
  formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

  // produto principal
  if (productImages) {
    productImages.forEach((file) => {
      formData.append('productImages', file);
    });
  }

  // variações
  if (variationImages) {
    // Aqui cada key é '0', '1', '2'... (string), mas Number(key) dá 0, 1, 2...
    Object.keys(variationImages).forEach((key) => {
      const indexNum = +key; // converte "0" em 0, "1" em 1...
      const files = variationImages[indexNum];
      if (files && files.length) {
        // AQUI concatenamos 'variationImages' + índice para o nome do campo
        files.forEach((file) => {
          formData.append(`variationImages${indexNum}`, file);
        });
      }
    });
  }

  // Logs do FormData
  console.log('--- FormData Entries ---');
  for (const pair of formData.entries()) {
    const value = pair[1] instanceof File ? (pair[1] as File).name : pair[1];
    console.log(`${pair[0]}: ${value}`);
  }
  console.log('------------------------');

  const response = await api.put<ProductDTO>(`/products/${id}`, formData);
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