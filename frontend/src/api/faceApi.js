import { apiClient } from './apiClient';

export const faceApi = {
  getStatus() {
    return apiClient.get('/face-recognition/status');
  },

  recordConsent(consentGiven) {
    return apiClient.post('/face-recognition/consent', { consentGiven });
  },

  enrollDescriptor(descriptor, photoSnapshot = null) {
    return apiClient.post('/face-recognition/enroll', { descriptor, photoSnapshot });
  },

  verifyAndMark(sessionId, sessionCode, liveDescriptor, deviceInfo = 'Facial Camera', capturedPhoto = null) {
    return apiClient.post('/face-recognition/verify', {
      sessionId,
      sessionCode,
      liveDescriptor,
      deviceInfo,
      capturedPhoto,
    });
  },

  getActiveSessions() {
    return apiClient.get('/face-recognition/active-sessions');
  },
};
