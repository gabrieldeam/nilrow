import api from '../api';
import {  ChannelDTO,  ChannelData,  FollowerData,  FollowingChannelData,  AboutData,  FAQData,} from '../../types/services/channel';

// Obtém todos os canais
export const getChannels = async () => {
  const response = await api.get<ChannelData[]>('/channels');
  return response.data;
};

// Adiciona um novo canal
export const addChannel = async (channelDTO: ChannelDTO) => {
  await api.post('/channels', channelDTO);
};

// Atualiza um canal
export const updateChannel = async (id: string, channelDTO: ChannelDTO) => {
  await api.put(`/channels/${id}`, channelDTO);
};

// Alterna a visibilidade de um canal
export const toggleChannelVisibility = async (id: string) => {
  const response = await api.put<boolean>(`/channels/${id}/toggle-visibility`);
  return response.data;
};

// Obtém o canal do usuário atual
export const getMyChannel = async () => {
  const response = await api.get<ChannelData>('/channels/my');
  return response.data;
};

// Verifica se o canal está ativo
export const isChannelActive = async (id: string) => {
  const response = await api.get<boolean>(`/channels/${id}/is-active`);
  return response.data;
};

// Obtém canal pelo nickname
export const getChannelByNickname = async (nickname: string): Promise<ChannelData | null> => {
  try {
    const response = await api.get<ChannelData>(`/channels/nickname/${nickname}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar canal com nickname "${nickname}":`, error);
    return null; // Retorna null se o canal não for encontrado
  }
};


// Verifica se o usuário é dono do canal
export const isChannelOwner = async (id: string) => {
  const response = await api.get<boolean>(`/channels/is-owner/${id}`);
  return response.data;
};

// Faz upload de imagem do canal
export const uploadChannelImage = async (id: string, imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post<string>(`/channels/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Atualiza a imagem do canal
export const updateChannelImage = async (channelId: string, imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.put<string>(`/channels/${channelId}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Obtém informações "Sobre" pelo nickname
export const getAboutByNickname = async (nickname: string) => {
  const response = await api.get<AboutData>(`/channels/nickname/${nickname}/about`);
  return response.data;
};

// Obtém FAQs pelo nickname
export const getFAQsByNickname = async (nickname: string) => {
  const response = await api.get<FAQData[]>(`/channels/nickname/${nickname}/faqs`);
  return response.data;
};
