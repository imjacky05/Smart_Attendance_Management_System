import { apiClient } from './apiClient';

export const authApi = {
  login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  register(data) {
    return apiClient.post('/auth/register', data);
  },

  getRegistrationClasses() {
    return apiClient.get('/auth/classes');
  },

  forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword(email, otp, newPassword) {
    return apiClient.post('/auth/reset-password', { email, otp, newPassword });
  },

  getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  getDemoAccounts() {
    return apiClient.get('/auth/demo-accounts');
  },
};
