import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

export const sendResetCode = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const login = async (login, password, location, device) => {
    try {
        const response = await api.post('/auth/login', { login, password, location, device });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const loginWithPhone = async (phone, password, location, device) => {
    try {
        const response = await api.post('/auth/login-phone', { phone, password, location, device });
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
        return { isAuthenticated: response.status === 200 };
    } catch (error) {
        console.error('Erro do axios: ', error);
        return { isAuthenticated: false };
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export default api;
