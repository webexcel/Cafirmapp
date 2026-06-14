import api from './client';
import { EP } from './endpoints';

export const authApi = {
  login: (data: { email: string; password: string; device_id: string }) =>
    api.post(`${EP.AUTH}/login`, data),

  forgotPassword: (data: { email: string }) =>
    api.post(`${EP.AUTH}/forgot_password`, data),

  resetPassword: (data: { email: string; newPassword: string; otp: string }) =>
    api.post(`${EP.AUTH}/reset_password`, data),

  getUserDetails: () =>
    api.get(`${EP.AUTH}/getUserDetails`),
};
