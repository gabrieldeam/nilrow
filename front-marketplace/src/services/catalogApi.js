import axios from 'axios';
import getConfig from '../config';

const { apiUrl } = getConfig();

const catalogApi = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

// POST /catalog/create
export const createCatalog = async (catalogDTO) => {
    try {
        const response = await catalogApi.post('/catalog/create', catalogDTO);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /catalog/visible
export const getVisibleCatalogs = async () => {
    try {
        const response = await catalogApi.get('/catalog/visible');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /catalog/hidden
export const getHiddenCatalogs = async () => {
    try {
        const response = await catalogApi.get('/catalog/hidden');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /catalog/{catalogId}
export const getCatalogByCatalogId = async (catalogId) => {
    try {
        const response = await catalogApi.get(`/catalog/${catalogId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// PUT /catalog/edit/{id}
export const editCatalog = async (id, catalogDTO) => {
    try {
        const response = await catalogApi.put(`/catalog/edit/${id}`, catalogDTO);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// DELETE /catalog/delete/{id}
export const deleteCatalog = async (id) => {
    try {
        await catalogApi.delete(`/catalog/delete/${id}`);
    } catch (error) {
        throw error;
    }
};

// PATCH /catalog/release/{id}
export const updateCatalogRelease = async (id, released) => {
    try {
        await catalogApi.patch(`/catalog/release/${id}`, null, {
            params: { released }
        });
    } catch (error) {
        throw error;
    }
};

// GET /catalog/{id}/is-released
export const isCatalogReleased = async (id) => {
    try {
        const response = await catalogApi.get(`/catalog/${id}/is-released`);
        return response.data;
    } catch (error) {
        console.error('Erro ao verificar se o catálogo está liberado:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// PATCH /catalog/visibility/{id}
export const updateCatalogVisibility = async (id, visible) => {
    try {
        await catalogApi.patch(`/catalog/visibility/${id}`, null, {
            params: { visible }
        });
    } catch (error) {
        throw error;
    }
};

// GET /catalog/{id}/is-visible
export const isCatalogVisible = async (id) => {
    try {
        const response = await catalogApi.get(`/catalog/${id}/is-visible`);
        return response.data;
    } catch (error) {
        console.error('Erro ao verificar se o catálogo está visível:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

// Função para buscar detalhes do local usando o Google Places através do seu backend Spring Boot
export const fetchPlaceDetails = async (placeId) => {
    try {
        const response = await catalogApi.get(`/google/google-place-details`, {
            params: { placeId }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar detalhes do lugar:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export default catalogApi;
