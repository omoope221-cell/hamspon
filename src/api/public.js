import { api } from './client';

// These hit /api/v1/public/* — no auth required, no bearer token needed.
// Used by the public site (Home, Leadership, Gallery, Contact,
// Admissions, Footer) instead of any hardcoded content.
export const publicApi = {
  getLeadership: () => api.get('/public/leadership'),
  getGallery: (params) => api.get('/public/gallery', params),
  getNewsEvents: (type) => api.get('/public/news-events', { type }),
  getNewsEventOne: (id) => api.get(`/public/news-events/${id}`),
  getSettings: () => api.get('/public/settings'),
  getFaqs: () => api.get('/public/faqs'),
  submitContactForm: (body) => api.post('/public/contact', body),
  submitAdmissionApplication: (formData) => api.postForm('/public/admissions/submit', formData),
};