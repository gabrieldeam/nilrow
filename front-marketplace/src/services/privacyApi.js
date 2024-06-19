import axios from 'axios';
import getConfig from '../config';

const { apiUrl } = getConfig();

const privacyApi = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// GET /accepts-sms
export const getAcceptsSms = async () => {
  try {
    const response = await privacyApi.get('/people/accepts-sms');
    return response.data; // Retornando a resposta como uma string simples
  } catch (error) {
    throw error; // Lançando o erro completo
  }
};

// PUT /accepts-sms
export const updateAcceptsSms = async (acceptsSms) => {
    try {
      const response = await privacyApi.put('/people/accepts-sms', { acceptsSms }); // Enviando como JSON
      return response.data;
    } catch (error) {
      throw error; // Lançando o erro completo
    }
};


// DELETE /user
export const deleteUser = async () => {
  try {
    const response = await privacyApi.delete('/user');
    return response.data;
  } catch (error) {
    throw error; // Lançando o erro completo
  }
};

export default privacyApi;
