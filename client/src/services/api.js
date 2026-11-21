import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 45000 // generous for image uploads and AI analysis
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civiceye_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const aiService = {
  async analyzeImage(imageFile, language = 'en') {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('language', language);

    const res = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

export const complaintService = {
  async createComplaint(formData) {
    // If formData is already FormData (e.g. includes file) send directly, else handle JSON
    const isFormData = formData instanceof FormData;
    const res = await api.post('/complaints', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  async getComplaints(filters = {}) {
    const res = await api.get('/complaints', { params: filters });
    return res.data;
  },

  async getComplaintById(id) {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },

  async updateStatus(id, formData) {
    const isFormData = formData instanceof FormData;
    const res = await api.patch(`/complaints/${id}/status`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  async assignComplaint(id, data) {
    const res = await api.patch(`/complaints/${id}/assign`, data);
    return res.data;
  },

  async checkDuplicate(data) {
    const res = await api.post('/complaints/check-duplicate', data);
    return res.data;
  },

  async getPublicStats() {
    const res = await api.get('/complaints/public-stats');
    return res.data;
  }
};

export default api;
