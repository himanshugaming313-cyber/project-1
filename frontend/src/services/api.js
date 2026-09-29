import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on auth endpoints, clear token
      if (
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/register')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Let React state handle redirection smoothly
      }
    }
    return Promise.reject(error);
  }
);

export default api;
