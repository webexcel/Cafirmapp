import api from './client';
import { EP } from './endpoints';

export const employeeApi = {
  getAll: () =>
    api.get(`${EP.EMPLOYEE}/getEmployees`),

  add: (data: any) =>
    api.post(`${EP.EMPLOYEE}/addEmployee`, data),

  delete: (data: { employee_id: number }) =>
    api.post(`${EP.EMPLOYEE}/deleteEmployee`, data),

  getDetails: (data: { employee_id: number }) =>
    api.post(`${EP.EMPLOYEE}/getEmployeeDetails`, data),

  edit: (data: any) =>
    api.post(`${EP.EMPLOYEE}/editEmployee`, data),

  getByPermission: (data: { emp_id: number }) =>
    api.post(`${EP.EMPLOYEE}/getEmployeesByPermission`, data),

  getWithoutPassword: () =>
    api.get(`${EP.EMPLOYEE}/getEmployeesNotPassword`),

  getUserAccounts: () =>
    api.get(`${EP.EMPLOYEE}/getUserAccounts`),

  addUserAccount: (data: any) =>
    api.post(`${EP.EMPLOYEE}/addUserAccount`, data),

  updatePassword: (data: any) =>
    api.post(`${EP.EMPLOYEE}/updatePassword`, data),
};
