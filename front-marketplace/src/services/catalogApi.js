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

// GET /catalog/{channelId}
export const getCatalogByChannelId = async (channelId) => {
    try {
        const response = await catalogApi.get(`/catalog/${channelId}`);
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

export const isCatalogReleased = async (id) => {
    try {
        const response = await catalogApi.get(`/catalog/${id}/is-released`);
        return response.data;
    } catch (error) {
        console.error('Erro ao verificar se o catálogo está liberado:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export default catalogApi;
