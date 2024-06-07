import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true, 
});

export const login = async (login, password) => {
    try {
        const response = await api.post('/auth/login', { login, password });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const loginWithPhone = async (phone, password) => {
    try {
        const response = await api.post('/auth/login-phone', { phone, password });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const register = async (data) => {
    try {
        const response = await api.post('/auth/register', data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export const checkAuth = async () => {
    try {
        const response = await api.get('/auth/check');
        return response.data;
    } catch (error) {
        console.error('Erro do axios: ', error);
        throw error.response ? error.response.data : new Error('Erro desconhecido');
    }
};

export default api;
