import api from './client';
import { EP } from './endpoints';

export const timesheetApi = {
  getAll: () =>
    api.get(`${EP.TIMESHEET}/getTimesheet`),

  add: (data: any) =>
    api.post(`${EP.TIMESHEET}/addTimesheet`, data),

  delete: (data: { timesheet_id: number }) =>
    api.post(`${EP.TIMESHEET}/deleteTimesheet`, data),

  getLimited: () =>
    api.get(`${EP.TIMESHEET}/getTimesheetLimited`),
};
