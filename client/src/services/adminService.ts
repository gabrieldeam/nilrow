import api from './api';
import { UserData, ChannelData, CatalogData } from '../types/services/admin';

// Busca todos os usuários
export const getAllUsers = async (page = 0, size = 10, sortBy = 'nickname') => {
  const response = await api.get<UserData[]>('/user/all', {
    params: { page, size, sortBy },
  });
  return response.data;
};

// Busca canal por ID da pessoa
export const getChannelByPersonId = async (personId: string) => {
  const response = await api.get<ChannelData>(`/channels/person/${personId}/channel`);
  return response.data;
};

// Busca catálogos por ID do canal
export const getCatalogsByChannelId = async (channelId: string) => {
  const response = await api.get<CatalogData[]>(`/catalog/channel/${channelId}/catalogs`);
  return response.data;
};
