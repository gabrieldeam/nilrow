import api from '../api';
import { FollowerData, FollowingChannelData } from '../../types/services/channel';

// Segue um canal
export const followChannel = async (channelId: string) => {
  await api.post(`/follows/follow/${channelId}`);
};

// Deixa de seguir um canal
export const unfollowChannel = async (channelId: string) => {
  await api.delete(`/follows/unfollow/${channelId}`);
};

// Verifica se está seguindo um canal
export const isFollowing = async (channelId: string) => {
  const response = await api.get<boolean>(`/follows/is-following/${channelId}`);
  return response.data;
};

// Obtém a contagem de seguidores
export const getFollowersCount = async (channelId: string) => {
  const response = await api.get<number>(`/follows/followers-count/${channelId}`);
  return response.data;
};

// Obtém canais seguidos por um nickname
export const getFollowingChannels = async (nickname: string, page = 0, size = 10) => {
  const response = await api.get<FollowingChannelData[]>(`/follows/following-channels/${nickname}`, {
    params: { page, size },
  });
  return response.data;
};

// Obtém seguidores de um nickname
export const getFollowers = async (nickname: string, page = 0, size = 10) => {
  const response = await api.get<FollowerData[]>(`/follows/followers/${nickname}`, {
    params: { page, size },
  });
  return response.data;
};

// Obtém a contagem de canais seguidos por um nickname
export const getFollowingCount = async (nickname: string) => {
  const response = await api.get<number>(`/follows/following-count/${nickname}`);
  return response.data;
};

// Obtém canais seguidos pelo usuário atual
export const getMyFollowingChannels = async (page = 0, size = 10) => {
  const response = await api.get<FollowingChannelData[]>('/follows/my-following-channels', {
    params: { page, size },
  });
  return response.data;
};
