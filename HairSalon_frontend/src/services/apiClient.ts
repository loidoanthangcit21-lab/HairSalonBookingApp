import axios from 'axios';
import { ENV } from '../config/env';
import { storage } from '../utils/storage';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // If the response data has our ApiResponse wrapper format, unwrap it
    if (response.data && response.data.hasOwnProperty('success')) {
      if (!response.data.success) {
        return Promise.reject(new Error(response.data.message || 'API Error'));
      }
      // Replace response.data with the unwrapped data payload
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clearAll();
    }
    if (error.response && error.response.data && error.response.data.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    return Promise.reject(error);
  }
);

