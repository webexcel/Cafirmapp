import api from './client';
import { EP } from './endpoints';

export const attendanceApi = {
  getAttendance: (data: any) =>
    api.post(`${EP.ATTENDANCE}/getAttendance`, data),

  login: (data: any) =>
    api.post(`${EP.ATTENDANCE}/loginAttendance`, data),

  logout: (data: any) =>
    api.post(`${EP.ATTENDANCE}/logoutAttendance`, data),

  getByDate: (data: any) =>
    api.post(`${EP.ATTENDANCE}/getAttendanceByDate`, data),

  checkToday: (data: { emp_id: number }) =>
    api.post(`${EP.ATTENDANCE}/checkTodayAttendance`, data),
};
