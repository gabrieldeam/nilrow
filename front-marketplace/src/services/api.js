import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

export const login = async (login, password) => {
    try {
        const response = await api.post('/auth/login', { login, password });
        localStorage.setItem('auth_token', response.data.token);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const loginWithPhone = async (phone, password) => {
    try {
        const response = await api.post('/auth/login-phone', { phone, password });
        localStorage.setItem('auth_token', response.data.token);
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
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { isAuthenticated: false };
        }
        const response = await api.get('/auth/check', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return { isAuthenticated: response.status === 200 };
    } catch (error) {
        console.error('Erro do axios: ', error);
        return { isAuthenticated: false };
    }
};

export default api;
