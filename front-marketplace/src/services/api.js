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

export const register = async (formData) => {
    try {
        const response = await api.post('/auth/register', formData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export default api;
