import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://celesticare-deployed.onrender.com/api';

const API = axios.create({
  baseURL: configuredApiUrl || defaultApiUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('celesticare_token');
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default API;
