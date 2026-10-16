import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rento-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const getError = (error) => error.response?.data?.message || 'Could not complete that request. Please try again.';
