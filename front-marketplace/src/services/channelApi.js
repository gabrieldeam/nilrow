import axios from 'axios';
import getConfig from '../config';

const { apiUrl } = getConfig();

const channelApi = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

// GET /channels
export const getChannels = async () => {
    try {
        const response = await channelApi.get('/channels');
        return response.data;
    } catch (error) {
        throw error; // Lançando o erro completo
    }
};

// POST /channels
export const addChannel = async (channelDTO) => {
    try {
        await channelApi.post('/channels', channelDTO);
    } catch (error) {
        throw error;
    }
};

// PUT /channels/{id}
export const updateChannel = async (id, channelDTO) => {
    try {
        await channelApi.put(`/channels/${id}`, channelDTO);
    } catch (error) {
        throw error;
    }
};

// PUT /channels/{id}/toggle-visibility
export const toggleChannelVisibility = async (id) => {
    try {
        const response = await channelApi.put(`/channels/${id}/toggle-visibility`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /channels/my
export const getMyChannel = async () => {
    try {
        const response = await channelApi.get('/channels/my');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /channels//{id}/is-active
export const isChannelActive = async (id) => {
    try {
        const response = await channelApi.get(`/channels/${id}/is-active`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /channels/nickname/{nickname}
export const getChannelByNickname = async (nickname) => {
    try {
        const response = await channelApi.get(`/channels/nickname/${nickname}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /channels/is-owner/{id}
export const isChannelOwner = async (id) => {
    try {
        const response = await channelApi.get(`/channels/is-owner/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// POST /channels/{id}/upload-image
export const uploadChannelImage = async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await channelApi.post(`/channels/${id}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// PUT /channels/{id}/upload-image
export const updateChannelImage = async (channelId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await channelApi.put(`/channels/${channelId}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// FOLLOW /follows/follow/{channelId}
export const followChannel = async (channelId) => {
    try {
        await channelApi.post(`/follows/follow/${channelId}`);
    } catch (error) {
        throw error;
    }
};

// UNFOLLOW /follows/unfollow/{channelId}
export const unfollowChannel = async (channelId) => {
    try {
        await channelApi.delete(`/follows/unfollow/${channelId}`);
    } catch (error) {
        throw error;
    }
};

// GET /follows/is-following/{channelId}
export const isFollowing = async (channelId) => {
    try {
        const response = await channelApi.get(`/follows/is-following/${channelId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /follows/followers-count/{channelId}
export const getFollowersCount = async (channelId) => {
    try {
        const response = await channelApi.get(`/follows/followers-count/${channelId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default channelApi;
