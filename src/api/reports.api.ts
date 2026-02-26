import api from './client';
import { EP } from './endpoints';

export const reportsApi = {
  employeeReport: (data: any) =>
    api.post(`${EP.CHARTS}/getEmployeeReport`, data),

  clientReport: (data: any) =>
    api.post(`${EP.CHARTS}/getClientReport`, data),

  employeeWeekly: (data: any) =>
    api.post(`${EP.CHARTS}/getWeeklyEmployeeReport`, data),

  employeeMonthly: (data: any) =>
    api.post(`${EP.CHARTS}/getMonthlyEmployeeReport`, data),

  employeeYearly: (data: any) =>
    api.post(`${EP.CHARTS}/getYearlyEmployeeReport`, data),

  clientWeekly: (data: any) =>
    api.post(`${EP.CHARTS}/getWeeklyClientReport`, data),

  clientMonthly: (data: any) =>
    api.post(`${EP.CHARTS}/getMonthlyClientReport`, data),

  clientYearly: (data: any) =>
    api.post(`${EP.CHARTS}/getYearlyClientReport`, data),

  getTaskByEmployeeId: (data: any) =>
    api.post(`${EP.CHARTS}/getTaskByEmployeeId`, data),

  getTaskByTaskId: (data: any) =>
    api.post(`${EP.CHARTS}/getTaskByTaskId`, data),
};
