import api from '../api';
import { AboutDTO, AboutData } from '../../types/services/channel';

// Cria um novo About
export const createAbout = async (aboutDTO: AboutDTO) => {
  const response = await api.post<AboutData>('/about/create', aboutDTO);
  return response.data;
};

// Obtém About pelo ID do canal
export const getAboutByChannelId = async (channelId: string) => {
  const response = await api.get<AboutData>(`/about/${channelId}`);
  return response.data;
};

// Edita um About existente
export const editAbout = async (id: string, aboutDTO: AboutDTO) => {
  const response = await api.put<AboutData>(`/about/edit/${id}`, aboutDTO);
  return response.data;
};

// Deleta um About
export const deleteAbout = async (id: string) => {
  await api.delete(`/about/delete/${id}`);
};

// Obtém About do canal do usuário atual
export const getMyChannelAboutId = async () => {
  const response = await api.get<AboutData>('/about/my-channel');
  return response.data;
};
