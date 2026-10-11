import { apiClient } from './apiClient';

export const facultyApi = {
  getDashboardStats() {
    return apiClient.get('/faculty/dashboard-stats');
  },

  getSubjects() {
    return apiClient.get('/faculty/subjects');
  },

  getClasses() {
    return apiClient.get('/faculty/classes');
  },

  createSession(payload) {
    return apiClient.post('/faculty/sessions', payload);
  },

  getActiveSessions() {
    return apiClient.get('/faculty/sessions/active');
  },

  closeSession(sessionId) {
    return apiClient.post(`/faculty/sessions/${sessionId}/close`, {});
  },

  getScannedStudents(sessionId) {
    return apiClient.get(`/faculty/sessions/${sessionId}/scanned-students`);
  },
};
