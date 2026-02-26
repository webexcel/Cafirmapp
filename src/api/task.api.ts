import api from './client';
import { EP } from './endpoints';

export const taskApi = {
  add: (data: any) =>
    api.post(`${EP.TASK}/addTask`, data),

  getByType: (data: any) =>
    api.post(`${EP.TASK}/getTasksByType`, data),

  updateStatus: (data: any) =>
    api.post(`${EP.TASK}/taskStatusUpdate`, data),

  delete: (data: { task_id: number }) =>
    api.post(`${EP.TASK}/deleteTask`, data),

  getByPriority: () =>
    api.get(`${EP.TASK}/getTasksByPriority`),

  getViewTasks: (data: any) =>
    api.post(`${EP.TASK}/getViewTasks`, data),

  edit: (data: any) =>
    api.post(`${EP.TASK}/editTask`, data),

  getServicesForTask: (data: any) =>
    api.post(`${EP.TASK}/getServicesForTask`, data),

  getLatest: () =>
    api.get(`${EP.TASK}/getLatestTasks`),

  getByClient: (data: { client_id: number }) =>
    api.post(`${EP.TASK}/getTasksByClient`, data),

  getPartners: () =>
    api.get(`${EP.TASK}/getPartners`),
};
