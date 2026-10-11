import { apiClient } from './apiClient';

export const reportApi = {
  getFilterOptions() {
    return apiClient.get('/reports/filter-options');
  },

  filterReports(filters) {
    return apiClient.post('/reports/filter', filters);
  },

  exportCsv(filters, filename) {
    return apiClient.downloadBlob('/reports/export-csv', filters, filename);
  },
};
