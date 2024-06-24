import axios from 'axios';
import getConfig from '../config';

const { apiUrl } = getConfig();

const chatApi = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

// POST /chats/start/{channelId}
export const startConversation = async (channelId, content) => {
    try {
        const response = await chatApi.post(`/chats/start/${channelId}`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// POST /chats/send/{conversationId}
export const sendMessage = async (conversationId, content) => {
    try {
        const response = await chatApi.post(`/chats/send/${conversationId}`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// DELETE /chats/message/{messageId}
export const deleteMessage = async (messageId) => {
    try {
        await chatApi.delete(`/chats/message/${messageId}`);
    } catch (error) {
        throw error;
    }
};

// PUT /chats/message/{messageId}
export const editMessage = async (messageId, newContent) => {
    try {
        const response = await chatApi.put(`/chats/message/${messageId}`, { newContent });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// DELETE /chats/conversation/{conversationId}
export const deleteConversation = async (conversationId) => {
    try {
        await chatApi.delete(`/chats/conversation/${conversationId}`);
    } catch (error) {
        throw error;
    }
};

// GET /chats/new-messages/{conversationId}
export const countNewMessages = async (conversationId) => {
    try {
        const response = await chatApi.get(`/chats/new-messages/${conversationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// PUT /chats/message/seen/{messageId}
export const markMessageAsSeen = async (messageId) => {
    try {
        await chatApi.put(`/chats/message/seen/${messageId}`);
    } catch (error) {
        throw error;
    }
};

// GET /chats/channels
export const listChannels = async () => {
    try {
        const response = await chatApi.get('/chats/channels');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// PUT /chats/block/{conversationId}
export const blockChannel = async (conversationId) => {
    try {
        await chatApi.put(`/chats/block/${conversationId}`);
    } catch (error) {
        throw error;
    }
};

// PUT /chats/disable/{conversationId}
export const disableChat = async (conversationId) => {
    try {
        await chatApi.put(`/chats/disable/${conversationId}`);
    } catch (error) {
        throw error;
    }
};

// GET /chats/conversations
export const getConversations = async () => {
    try {
        const response = await chatApi.get('/chats/conversations');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// GET /chats/conversation/{conversationId}/messages
export const getMessagesByConversation = async (conversationId) => {
    try {
        const response = await chatApi.get(`/chats/conversation/${conversationId}/messages`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// PUT /chats/conversation/{conversationId}/messages/read
export const markAllMessagesAsRead = async (conversationId) => {
    try {
        await chatApi.put(`/chats/conversation/${conversationId}/messages/read`);
    } catch (error) {
        throw error;
    }
};

// GET /chats/conversation/{conversationId}/messages/search
export const searchMessagesInConversation = async (conversationId, query) => {
    try {
        const response = await chatApi.get(`/chats/conversation/${conversationId}/messages/search`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default chatApi;
