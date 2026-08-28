import api from './api';

export const authService = {
  signup: (data) => api.post('/auth/signup', data).then((r) => r.data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data).then((r) => r.data),
  resendOtp: (data) => api.post('/auth/resend-otp', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }).then((r) => r.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then((r) => r.data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
};

export default authService;
