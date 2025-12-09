import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Vercel APIのURL、または開発時は'/api'
});

export default api;
