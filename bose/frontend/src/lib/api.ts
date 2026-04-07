import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE,
  withCredentials: false,
});

// Attach user-identity headers from localStorage on every request.
// These replace the former JWT Authorization header.
api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('bose_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      config.headers = config.headers || {};
      if (user.id)           config.headers['x-user-id']    = user.id;
      if (user.role)         config.headers['x-user-role']  = user.role;
      if (user.email)        config.headers['x-user-email'] = user.email;
      if (user.organization) config.headers['x-user-org']   = user.organization;
    } catch {
      // ignore malformed JSON
    }
  }
  return config;
});

export default api;
