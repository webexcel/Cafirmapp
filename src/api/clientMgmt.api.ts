import api from './client';
import { EP } from './endpoints';

export const clientMgmtApi = {
  getAll: () =>
    api.get(`${EP.CLIENT}/getClients`),

  add: (data: any) =>
    api.post(`${EP.CLIENT}/addClient`, data),

  delete: (data: { client_id: number }) =>
    api.post(`${EP.CLIENT}/deleteClient`, data),

  getDetails: (data: { client_id: number }) =>
    api.post(`${EP.CLIENT}/getClientDetails`, data),

  edit: (data: any) =>
    api.post(`${EP.CLIENT}/editClient`, data),
};

// Alias for consumers that import the client API as `clientApi`
// (CreateTaskScreen, ClientReportScreen, useClients).
export const clientApi = clientMgmtApi;
