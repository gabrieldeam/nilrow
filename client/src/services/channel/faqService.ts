import api from '../api';
import { FAQDTO, FAQData } from '../../types/services/channel';

// Cria um novo FAQ
export const createFAQ = async (faqDTO: FAQDTO) => {
  const response = await api.post<FAQData>('/faqs/create', faqDTO);
  return response.data;
};

// Obtém FAQ pelo ID
export const getFAQById = async (id: string) => {
  const response = await api.get<FAQData>(`/faqs/${id}`);
  return response.data;
};

// Edita um FAQ existente
export const editFAQ = async (id: string, faqDTO: FAQDTO) => {
  const response = await api.put<FAQData>(`/faqs/edit/${id}`, faqDTO);
  return response.data;
};

// Deleta um FAQ
export const deleteFAQ = async (id: string) => {
  await api.delete(`/faqs/delete/${id}`);
};

// Obtém todos os FAQs de um About específico
export const getFAQsByAboutId = async (aboutId: string) => {
  const response = await api.get<FAQData[]>(`/faqs/about/${aboutId}`);
  return response.data;
};
