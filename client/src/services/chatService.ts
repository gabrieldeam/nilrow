import api from './api';
import {  MessageContent,  MessageData,  ConversationData,  ChannelData,  BlockStatus,} from '../types/services/chat';

// Inicia uma nova conversa
export const startConversation = async (channelId: string, content: string) => {
  const response = await api.post<string>(`/chats/start/${channelId}`, content, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return response.data;
};

// Envia uma mensagem
export const sendMessage = async (conversationId: string, content: string) => {
  const response = await api.post<MessageData>(`/chats/send/${conversationId}`, null, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: { content },
  });
  return response.data;
};

// Envia uma imagem
export const sendImage = async (conversationId: string, imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post<MessageData>(`/chats/send-image/${conversationId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Deleta uma mensagem
export const deleteMessage = async (messageId: string) => {
  await api.delete(`/chats/message/${messageId}`);
};

// Edita uma mensagem
export const editMessage = async (messageId: string, newContent: string) => {
  const response = await api.put<MessageData>(`/chats/message/${messageId}`, newContent, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return response.data;
};

// Deleta uma conversa
export const deleteConversation = async (conversationId: string) => {
  await api.delete(`/chats/conversation/${conversationId}`);
};

// Conta novas mensagens em uma conversa
export const countNewMessages = async (conversationId: string) => {
  const response = await api.get<number>(`/chats/new-messages/${conversationId}`);
  return response.data;
};

// Marca mensagem como lida
export const markMessageAsSeen = async (messageId: string) => {
  await api.put(`/chats/message/seen/${messageId}`);
};

// Lista todos os canais
export const listChannels = async () => {
  const response = await api.get<ChannelData[]>('/chats/channels');
  return response.data;
};

// Verifica status de bloqueio
export const getBlockStatus = async (conversationId: string) => {
  const response = await api.get<BlockStatus>(`/chats/block-status/${conversationId}`);
  return response.data;
};

// Bloqueia um canal
export const blockChannel = async (conversationId: string) => {
  const response = await api.put(`/chats/block/${conversationId}`);
  return response.data;
};

// Alterna o modo mudo em uma conversa
export const toggleMuteConversation = async (conversationId: string) => {
  const response = await api.put(`/chats/conversation/${conversationId}/mute`);
  return response.data;
};

// Verifica se uma conversa está silenciada
export const checkIfMuted = async (conversationId: string) => {
  const response = await api.get<boolean>(`/chats/conversation/${conversationId}/is-muted-by-me`);
  return response.data;
};

// Desabilita o chat
export const disableChat = async (conversationId: string) => {
  await api.put(`/chats/disable/${conversationId}`);
};

// Obtém todas as conversas
export const getConversations = async () => {
  const response = await api.get<ConversationData[]>('/chats/conversations');
  return response.data;
};

// Obtém conversas de um canal
export const getChannelConversations = async () => {
  const response = await api.get<ConversationData[]>('/chats/conversations/channel');
  return response.data;
};

// Obtém mensagens por conversa
export const getMessagesByConversation = async (conversationId: string) => {
  const response = await api.get<MessageData[]>(`/chats/conversation/${conversationId}/messages`);
  return response.data;
};

// Marca todas as mensagens como lidas
export const markAllMessagesAsRead = async (conversationId: string) => {
  await api.put(`/chats/conversation/${conversationId}/messages/read`);
};
