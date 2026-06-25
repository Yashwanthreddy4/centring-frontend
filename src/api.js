import axios from 'axios';
import { io } from 'socket.io-client';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const socket = io(BASE, { autoConnect: false });

const api = axios.create({ baseURL: BASE + '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
