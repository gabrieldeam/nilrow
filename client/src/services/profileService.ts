import api from './api';
import { ProfileData, AddressData, ProfileUpdateData } from '../types/services/profile';

export const getUserProfile = async () => {
  const response = await api.get('/people');
  return response.data;
};

export const updateUserProfile = async (  data: ProfileUpdateData ): Promise<ProfileData> => {
  const response = await api.put('/people', data);
  return response.data;
};

export const getUserNickname = async () => {
  const response = await api.get('/user/nickname');
  return response.data;
};

export const updateUserNickname = async (newNickname: string) => {
  const response = await api.put('/user/nickname', { newNickname });
  return response.data;
};

export const getEmailValidated = async () => {
  const response = await api.get('/people/email-validated');
  return response.data;
};

export const getAddresses = async () => {
  const response = await api.get('/address');
  return response.data;
};

export const addAddress = async (addressData: AddressData) => {
  const response = await api.post('/address', addressData);
  return response.data;
};

export const getAddressById = async (id: string) => {
  const response = await api.get(`/address/${id}`);
  return response.data;
};

export const updateAddress = async (id: string, addressData: AddressData) => {
  const response = await api.put(`/address/${id}`, addressData);
  return response.data;
};

export const deleteAddress = async (id: string) => {
  const response = await api.delete(`/address/${id}`);
  return response.data;
};

export const getAddressClassifications = async () => {
  const response = await api.get('/address/classifications');
  return response.data;
};
