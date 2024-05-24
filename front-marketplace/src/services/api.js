import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

export const login = async (login, password) => {
    try {
        const response = await api.post('/auth/login', { login, password });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
