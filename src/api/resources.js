import { api } from './client';
import { makeResource } from './resource';

export const usersApi = {
  ...makeResource('/users'),
  createStaff: (body) => api.post('/users/staff', body),
  createParent: (body) => api.post('/users/parent', body),
  createStudent: (body) => api.post('/users/student', body),
  setStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  setPermissions: (id, permissions) => api.patch(`/users/${id}/permissions`, { permissions }),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  getResetLogs: (params) => api.get('/users/password-reset-logs', params),
};

export const studentsApi = {
  ...makeResource('/students'),
  promote: (studentIds, toClassId) => api.post('/students/promote', { studentIds, toClassId }),
  uploadPhoto: (id, formData) => api.postForm(`/students/${id}/photo`, formData),
};

export const staffApi = {
  ...makeResource('/staff'),
  updateAssignments: (id, classIds, subjectIds) =>
    api.patch(`/staff/${id}/assignments`, { classIds, subjectIds }),
};

export const classesApi = makeResource('/classes');
export const subjectsApi = makeResource('/subjects');

export const sessionsApi = {
  ...makeResource('/sessions'),
  getCurrent: () => api.get('/sessions/current'),
  setCurrent: (id, termId) => api.patch(`/sessions/${id}/set-current`, { termId }),
};

export const examsApi = makeResource('/exams');

export const resultsApi = {
  getAll: (params) => api.get('/results', params),
  getOne: (id) => api.get(`/results/${id}`),
  upsert: (body) => api.post('/results', body),
  submit: (id) => api.patch(`/results/${id}/submit`),
  approve: (id, principalComment) => api.patch(`/results/${id}/approve`, { principalComment }),
  reject: (id, reason) => api.patch(`/results/${id}/reject`, { reason }),
};

export const feesApi = makeResource('/fees');

export const studentFeeBillsApi = {
  ...makeResource('/student-fee-bills'),
  upsert: (body) => api.post('/student-fee-bills', body),
  updatePaymentStatus: (id, amountPaid) => api.patch(`/student-fee-bills/${id}/payment-status`, { amountPaid }),
};

export const parentsApi = {
  ...makeResource('/parents'),
  getMe: () => api.get('/parents/me'),
};

export const paymentsApi = {
  getAll: (params) => api.get('/payments', params),
  record: (body) => api.post('/payments', body),
  balance: (studentId) => api.get('/payments/balance', { studentId }),
};

export const leadershipApi = {
  ...makeResource('/leadership'),
  uploadPhoto: (id, formData) => api.postForm(`/leadership/${id}/photo`, formData),
};

export const galleryApi = {
  getAll: (params) => api.get('/gallery', params),
  upload: (formData) => api.postForm('/gallery', formData),
  update: (id, body) => api.patch(`/gallery/${id}`, body),
  remove: (id) => api.delete(`/gallery/${id}`),
};

export const newsEventsApi = {
  getAll: (params) => api.get('/news-events', params),
  getOne: (id) => api.get(`/news-events/${id}`),
  create: (formData) => api.postForm('/news-events', formData),
  update: (id, body) => api.patch(`/news-events/${id}`, body),
  remove: (id) => api.delete(`/news-events/${id}`),
};

export const siteSettingsApi = {
  get: () => api.get('/site-settings'),
  update: (body) => api.patch('/site-settings', body),
  uploadImage: (target, formData) => api.postForm(`/site-settings/image?target=${target}`, formData),
  uploadVideo: (formData) => api.postForm('/site-settings/video', formData),
  removeHeroImage: (index) => api.delete(`/site-settings/hero-image/${index}`),
};

export const admissionsApplicationsApi = {
  getAll: (params) => api.get('/admissions', params),
  getOne: (id) => api.get(`/admissions/${id}`),
  updateStatus: (id, body) => api.patch(`/admissions/${id}/status`, body),
  remove: (id) => api.delete(`/admissions/${id}`),
};

export const faqApi = {
  getAll: (params) => api.get('/faqs', params),
  create: (body) => api.post('/faqs', body),
  update: (id, body) => api.patch(`/faqs/${id}`, body),
  remove: (id) => api.delete(`/faqs/${id}`),
  reorder: (order) => api.patch('/faqs/reorder', { order }),
};

export const notificationsApi = {
  getAll: (params) => api.get('/notifications', params),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const dashboardApi = { summary: () => api.get('/dashboard/summary') };
