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
    // Only a 401 (authentication failure / expired token) should clear the
    // session. A 403 means the token is valid but lacks permission for that
    // specific action — clearing auth here nukes the token and cascades every
    // subsequent request into a 401, breaking the whole app over one denied call.
    if (error.response && error.response.status === 401) {
      await clearAuth();
    }
    return Promise.reject(error);
  },
);

export default api;
