import { api } from './client';

export const authApi = {
  login: (accountType, identifier, password) =>
    api.post('/auth/login', { accountType, identifier, password }),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  // Super Admin only — see backend/routes/authRoutes.js. Staff and
  // Student passwords can only be changed by the Super Admin via
  // usersApi.resetPassword; they never call any of these three.
  changePassword: (currentPassword, newPassword) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }),
  // Admin-only OTP forgot-password flow (3 steps: request code, verify
  // code, set new password).
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
};