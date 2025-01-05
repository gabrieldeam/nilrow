import api from './api';
import { AcceptsSmsDTO } from '../types/services/privacy';

// Obter se o usuário aceita SMS
export const getAcceptsSms = async () => {
  const response = await api.get<string>('/people/accepts-sms');
  return response.data;
};

// Atualizar se o usuário aceita SMS
export const updateAcceptsSms = async (acceptsSms: boolean) => {
  const response = await api.put('/people/accepts-sms', { acceptsSms });
  return response.data;
};

// Deletar o usuário
export const deleteUser = async () => {
  const response = await api.delete('/user');
  return response.data;
};
