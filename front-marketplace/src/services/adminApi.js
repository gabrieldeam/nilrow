import axios from 'axios';
import getConfig from '../../../config';

const { apiUrl } = getConfig();

const adminApi = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

export const getAllUsers = async (page = 0, size = 10, sortBy = 'nickname') => {
    try {
        const response = await adminApi.get('/user/all', {
            params: { page, size, sortBy }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export const getChannelByPersonId = async (personId) => {
    try {
        const response = await adminApi.get(`/channels/person/${personId}/channel`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar canal pelo ID da pessoa:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export const getCatalogsByChannelId = async (channelId) => {
    try {
        const response = await adminApi.get(`/catalog/channel/${channelId}/catalogs`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar catálogos pelo ID do canal:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export const updateCatalogRelease = async (id, released) => {
    try {
        const response = await adminApi.patch(`/catalog/release/${id}`, null, {
            params: { released }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar o status de liberação do catálogo:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export const isCatalogReleased = async (id) => {
    try {
        const response = await adminApi.get(`/catalog/${id}/is-released`);
        return response.data;
    } catch (error) {
        console.error('Erro ao verificar se o catálogo está liberado:', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export default adminApi;
