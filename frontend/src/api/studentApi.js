import { apiClient } from './apiClient';

export const studentApi = {
  getProfile() {
    return apiClient.get('/student/profile');
  },

  markAttendance(qrToken, deviceInfo = 'Web Camera Scanner') {
    return apiClient.post('/student/mark-attendance', {
      qrToken,
      method: 'QR_SCAN',
      deviceInfo,
    });
  },

  getHistory() {
    return apiClient.get('/student/history');
  },

  getStats() {
    return apiClient.get('/student/stats');
  },
};
