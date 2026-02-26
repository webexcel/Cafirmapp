import api from './client';
import { EP } from './endpoints';

export const permissionsApi = {
  getList: () =>
    api.get(`${EP.PERMISSIONS}/permissions`),

  getMenuOperations: () =>
    api.get(`${EP.PERMISSIONS}/menu-operations`),

  add: (data: any) =>
    api.post(`${EP.PERMISSIONS}/add`, data),

  getUserPermissions: (userId: number) =>
    api.get(`${EP.PERMISSIONS}/user/${userId}`),

  update: (permissionId: number, data: any) =>
    api.put(`${EP.PERMISSIONS}/update/${permissionId}`, data),

  assign: (data: any) =>
    api.post(`${EP.PERMISSIONS}/assign`, data),

  getAllUsers: () =>
    api.get(`${EP.PERMISSIONS}/allusers`),

  // Menu management
  getMenuList: () =>
    api.get(`${EP.MENU}/getMenuList`),

  addMenu: (data: any) =>
    api.post(`${EP.MENU}/addMenu`, data),

  getParentMenuList: () =>
    api.get(`${EP.MENU}/getParentMenuList`),

  addMenuOperations: (data: any) =>
    api.post(`${EP.MENU}/addMenuOperations`, data),

  deleteMenu: (data: any) =>
    api.post(`${EP.MENU}/deleteMenu`, data),

  updateMenu: (data: any) =>
    api.post(`${EP.MENU}/updateMenu`, data),
};
