import axios from 'axios';

const profileApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

// GET /people
export const getUserProfile = async () => {
    try {
        const response = await profileApi.get('/people');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// PUT /people
export const updateUserProfile = async (profileData) => {
    try {
        const response = await profileApi.put('/people', profileData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// GET /user/nickname
export const getUserNickname = async () => {
    try {
        const response = await profileApi.get('/user/nickname');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// PUT /user/nickname
export const updateUserNickname = async (newNickname) => {
    try {
        const response = await profileApi.put('/user/nickname', { newNickname });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export default profileApi;
