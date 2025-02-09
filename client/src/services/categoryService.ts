import api from './api';
import { SubCategoryDTO, UserCategoryOrderDTO, CategoryData, SubCategoryData } from '../types/services/category';

// Criar uma nova categoria
export const createCategory = async (name: string, image?: File | null) => {
  const formData = new FormData();
  const category = { name };
  formData.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));

  if (image) {
    formData.append('image', image);
  }

  const response = await api.post<CategoryData>('/categories/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Obter uma categoria pelo ID
export const getCategoryById = async (id: string) => {
  const response = await api.get<CategoryData>(`/categories/${id}`);
  return response.data;
};

// Obter todas as categorias com paginação
export const getAllCategories = async (page: number, size: number) => {
  const response = await api.get('/categories/all', { params: { page, size } });
  return response.data.content || [];
};


// Buscar categorias pelo nome
export const searchCategoriesByName = async (name: string) => {
  const response = await api.get<CategoryData[]>('/categories/search', { params: { name } });
  return response.data;
};

// Atualizar uma categoria
export const updateCategory = async (id: string, name: string, image?: File) => {
  const formData = new FormData();
  const category = { id, name };
  formData.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));

  if (image) {
    formData.append('image', image);
  }

  const response = await api.put<CategoryData>(`/categories/edit/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Deletar uma categoria
export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/delete/${id}`);
};

// Criar uma nova subcategoria
export const createSubCategory = async (subCategory: SubCategoryDTO) => {
  const response = await api.post<SubCategoryData>('/subcategory/create', subCategory);
  return response.data;
};

// Atualizar uma subcategoria
export const updateSubCategory = async (id: string, subCategory: SubCategoryDTO) => {
  const response = await api.put<SubCategoryData>(`/subcategory/edit/${id}`, subCategory);
  return response.data;
};

// Deletar uma subcategoria
export const deleteSubCategory = async (id: string) => {
  await api.delete(`/subcategory/delete/${id}`);
};

// Obter todas as subcategorias de uma categoria
export const getSubCategoriesByCategory = async (categoryId: string | number) => {
  const response = await api.get(`/subcategory/category/${categoryId}`);
  return response.data;
};


// Obter subcategoria por ID
export const getSubCategoryById = async (id: string) => {
  const response = await api.get<SubCategoryData>(`/subcategory/${id}`);
  return response.data;
};

// Obter todas as ordens de exibição de categorias do usuário autenticado
export const getAllUserCategoryOrders = async () => {
  const response = await api.get<UserCategoryOrderDTO[]>('/user-category-order/all');
  return response.data;
};

// Upsert: Cria ou Atualiza a ordem de exibição de categoria do usuário
export const upsertUserCategoryOrder = async (orderDTOs: UserCategoryOrderDTO[]) => {
  const response = await api.put('/user-category-order/upsert', orderDTOs);
  return response.data;
};

