import axios from 'axios';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: 'http://localhost:8000', // Backend server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/me/'),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUserStatus: (username, isActive) => api.put(`/admin/users/${username}/status`, { is_active: isActive }),
  assignPaperwork: (paperworkData) => api.post('/admin/paperworks', paperworkData),
  reviewPaperwork: (id, reviewData) => api.post(`/api/paperworks/${id}/review`, reviewData),
};

// Paperworks API
export const paperworksAPI = {
  getAllPaperworks: () => api.get('/api/paperworks'),
  getPaperworkById: (id) => api.get(`/api/paperworks/${id}`),
  createPaperwork: (formData) => api.post('/api/paperworks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  submitVersion: (id, versionData) => api.post(`/api/paperworks/${id}/versions`, versionData),
  getVersions: (id) => api.get(`/api/paperworks/${id}/versions`),
  getVersionDetails: (id, versionId) => api.get(`/api/paperworks/${id}/versions/${versionId}`),
  downloadFile: (url) => api.get(url, { responseType: 'blob' }),
};

// Reports API
export const reportsAPI = {
  getSummary: () => api.get('/api/reports/summary'),
  exportCSV: () => api.get('/api/reports/export-csv', { responseType: 'blob' }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications/'),
  markAsRead: (notificationId) => api.post(`/api/notifications/${notificationId}/read`)
};

export default api;