import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  withCredentials: true, 
});

// api.interceptors.response.use(
//   response => response, 
//   error => {
//     const errorMessage = error.response?.data?.message || 'Erro desconhecido';
//     console.error('Erro na requisição:', errorMessage);
//     return Promise.reject(new Error(errorMessage));
//   }
// );

export default api;
