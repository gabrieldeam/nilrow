import axios from 'axios';

const adminCategoryApi = axios.create({
    baseURL: 'http://localhost:8080/api/categories',
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

        const response = await adminCategoryApi.post('/create', formData, {
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
        const response = await adminCategoryApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar categoria pelo ID:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Obter todas as categorias
export const getAllCategories = async () => {
    try {
        const response = await adminCategoryApi.get('/all');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar todas as categorias:', error);
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

        const response = await adminCategoryApi.put(`/edit/${id}`, formData, {
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
        await adminCategoryApi.delete(`/delete/${id}`);
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export default adminCategoryApi;
