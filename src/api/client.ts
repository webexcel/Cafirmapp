import axios from 'axios';
import { getToken, clearAuth } from '../utils/secureStorage';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      await clearAuth();
    }
    return Promise.reject(error);
  },
);

export default api;
