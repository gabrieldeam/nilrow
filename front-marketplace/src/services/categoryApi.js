import axios from 'axios';

const categoryApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

// Criar uma nova categoria
export const createCategory = async (name, image) => {
    try {
        const formData = new FormData();
        const category = {
            name: name
        };

        // Adiciona o objeto JSON como uma string no FormData
        formData.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));

        if (image) {
            formData.append('image', image); // Adiciona a imagem ao FormData
        }

        const response = await categoryApi.post('/categories/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};


// Obter uma categoria pelo ID
export const getCategoryById = async (id) => {
    try {
        const response = await categoryApi.get(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar categoria pelo ID:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Obter todas as categorias com paginação
export const getAllCategories = async (page, size) => {
    try {
        const response = await categoryApi.get(`/categories/all?page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar todas as categorias:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Buscar categorias pelo nome
export const searchCategoriesByName = async (name) => {
    try {
        const response = await categoryApi.get(`/categories/search?name=${name}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar categorias por nome:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};


// Atualizar uma categoria
export const updateCategory = async (id, name, image) => {
    try {
        const formData = new FormData();
        const category = {
            id: id,
            name: name
        };

        // Adiciona o objeto JSON como uma string no FormData
        formData.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));

        if (image) {
            formData.append('image', image); // Adiciona a imagem ao FormData
        }

        const response = await categoryApi.put(`/categories/edit/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};


// Deletar uma categoria
export const deleteCategory = async (id) => {
    try {
        await categoryApi.delete(`/categories/delete/${id}`);
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Endpoints para subcategorias

// Criar uma nova subcategoria
export const createSubCategory = async (subCategory) => {
    try {
        const response = await categoryApi.post('/subcategory/create', subCategory, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar subcategoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Atualizar uma subcategoria
export const updateSubCategory = async (id, subCategory) => {
    try {
        const response = await categoryApi.put(`/subcategory/edit/${id}`, subCategory, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar subcategoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Deletar uma subcategoria
export const deleteSubCategory = async (id) => {
    try {
        await categoryApi.delete(`/subcategory/delete/${id}`);
    } catch (error) {
        console.error('Erro ao deletar subcategoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Obter todas as subcategorias de uma categoria
export const getSubCategoriesByCategory = async (categoryId) => {
    try {
        const response = await categoryApi.get(`/subcategory/category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar subcategorias por categoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Obter subcategoria por ID
export const getSubCategoryById = async (id) => {
    try {
        const response = await categoryApi.get(`/subcategory/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar subcategoria pelo ID:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export default categoryApi;
