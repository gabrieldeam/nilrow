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
        const response = await chatApi.post(`/chats/start/${channelId}`, content, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// POST /chats/send/{conversationId}
export const sendMessage = async (conversationId, content) => {
    try {
        const response = await chatApi.post(`/chats/send/${conversationId}`, content, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data); // Lança a mensagem de erro do corpo da resposta
        } else {
            throw new Error('Erro desconhecido ao enviar a mensagem.');
        }
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
        const response = await chatApi.put(`/chats/message/${messageId}`, newContent, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
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

// GET /chats/block-status/{conversationId}
export const getBlockStatus = async (conversationId) => {
    try {
        const response = await chatApi.get(`/chats/block-status/${conversationId}`);
        return response.data; // Supondo que a resposta seja um boolean
    } catch (error) {
        throw error;
    }
};

// PUT /chats/block/{conversationId}
export const blockChannel = async (conversationId) => {
    try {
        const response = await chatApi.put(`/chats/block/${conversationId}`);
        return response.data; // Retorne a resposta do backend
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data); // Lança a mensagem de erro do corpo da resposta
        } else {
            throw new Error('Erro desconhecido ao bloquear o canal.');
        }
    }
};

// Função para chamar o endpoint de alternar o silêncio
export const toggleMuteConversation = async (conversationId) => {
    try {
        const response = await chatApi.put(`/chats/conversation/${conversationId}/mute`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Função para verificar se a conversa está silenciada
export const checkIfMuted = async (conversationId) => {
    try {
        const response = await chatApi.get(`/chats/conversation/${conversationId}/is-muted-by-me`);
        return response.data;
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

// GET /chats/conversations/channel
export const getChannelConversations = async () => {
    try {
        const response = await chatApi.get('/chats/conversations/channel');
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

export default chatApi;
