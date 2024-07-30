import axios from 'axios';
import getConfig from '../config';

const { apiUrl } = getConfig();

const aboutApi = axios.create({
    baseURL: `${apiUrl}/about`, 
    withCredentials: true,
});

// POST /about/create
export const createAbout = async (aboutDTO) => {
    try {
        const response = await aboutApi.post('/create', aboutDTO);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /about/{channelId}
export const getAboutByChannelId = async (channelId) => {
    try {
        const response = await aboutApi.get(`/${channelId}`);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// PUT /about/edit/{id}
export const editAbout = async (id, aboutDTO) => {
    try {
        const response = await aboutApi.put(`/edit/${id}`, aboutDTO);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// DELETE /about/delete/{id}
export const deleteAbout = async (id) => {
    try {
        await aboutApi.delete(`/delete/${id}`);
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

export default aboutApi;
