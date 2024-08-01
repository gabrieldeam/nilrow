import axios from 'axios';
import getConfig from '../config';

const { apiUrl } = getConfig();

const aboutApi = axios.create({
    baseURL: apiUrl, 
    withCredentials: true,
});

// APIs About

// POST /about/create
export const createAbout = async (aboutDTO) => {
    try {
        const response = await aboutApi.post('/about/create', aboutDTO);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /about/{channelId}
export const getAboutByChannelId = async (channelId) => {
    try {
        const response = await aboutApi.get(`/about/${channelId}`);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// PUT /about/edit/{id}
export const editAbout = async (id, aboutDTO) => {
    try {
        const response = await aboutApi.put(`/about/edit/${id}`, aboutDTO);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// DELETE /about/delete/{id}
export const deleteAbout = async (id) => {
    try {
        await aboutApi.delete(`/about/delete/${id}`);
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /about/my-channel
export const getMyChannelAboutId = async () => {
    try {
        const response = await aboutApi.get('/about/my-channel');
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// APIs FAQ

// POST /faqs/create
export const createFAQ = async (faqDTO) => {
    try {
        const response = await aboutApi.post('/faqs/create', faqDTO);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /faqs/{id}
export const getFAQById = async (id) => {
    try {
        const response = await aboutApi.get(`/faqs/${id}`);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// PUT /faqs/edit/{id}
export const editFAQ = async (id, faqDTO) => {
    try {
        const response = await aboutApi.put(`/faqs/edit/${id}`, faqDTO);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// DELETE /faqs/delete/{id}
export const deleteFAQ = async (id) => {
    try {
        await aboutApi.delete(`/faqs/delete/${id}`);
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /faqs/about/{aboutId}
export const getFAQsByAboutId = async (aboutId) => {
    try {
        const response = await aboutApi.get(`/faqs/about/${aboutId}`);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

export default aboutApi;
