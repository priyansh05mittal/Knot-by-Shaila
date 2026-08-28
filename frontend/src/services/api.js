import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    error.friendlyMessage = message;

    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      // Let calling code decide whether to redirect; just tag the error.
      error.isUnauthorized = true;
    }

    return Promise.reject(error);
  }
);

export default api;
