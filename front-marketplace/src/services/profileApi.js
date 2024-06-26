import axios from 'axios';
import getConfig from '../config';

const { apiUrl } = getConfig();

const profileApi = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

// GET /people
export const getUserProfile = async () => {
    try {
        const response = await profileApi.get('/people');
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// PUT /people
export const updateUserProfile = async (profileData) => {
    try {
        const response = await profileApi.put('/people', profileData);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /user/nickname
export const getUserNickname = async () => {
    try {
        const response = await profileApi.get('/user/nickname');
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// PUT /user/nickname
export const updateUserNickname = async (newNickname) => {
    try {
        const response = await profileApi.put('/user/nickname', { newNickname });
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /people/email-validated
export const getEmailValidated = async () => {
    try {
        const response = await profileApi.get('/people/email-validated');
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /address
export const getAddresses = async () => {
    try {
        const response = await profileApi.get('/address');
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// POST /address
export const addAddress = async (addressData) => {
    try {
        const response = await profileApi.post('/address', addressData);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /address/{id}
export const getAddressById = async (id) => {
    try {
        const response = await profileApi.get(`/address/${id}`);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};


// PUT /address/{id}
export const updateAddress = async (id, addressData) => {
    try {
        const response = await profileApi.put(`/address/${id}`, addressData);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// DELETE /address/{id}
export const deleteAddress = async (id) => {
    try {
        const response = await profileApi.delete(`/address/${id}`);
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// GET /address/classifications
export const getAddressClassifications = async () => {
    try {
        const response = await profileApi.get('/address/classifications');
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

export default profileApi;
