import api from './api';

// Obter se o usuário aceita SMS
export const getAcceptsSms = async (): Promise<boolean> => {
  const response = await api.get<boolean>('/people/accepts-sms');
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
