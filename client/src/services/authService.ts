import api from './api';
import { LoginData, ResetPasswordData, RegisterData } from '../types/services/auth';

export const sendResetCode = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const loginWithPhone = async (phone: string, password: string, location?: string, device?: string) => {
  const response = await api.post('/auth/login-phone', { phone, password, location, device });
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const checkAuth = async () => {
  const response = await api.get('/auth/check');
  return { isAuthenticated: response.status === 200 };
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const isAdmin = async () => {
  const response = await api.get('/auth/is-admin');
  return response.data;
};
