export const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000/api')
  : (import.meta.env.VITE_API_URL || 'https://propertyfiling-backendnode.onrender.com/api');
