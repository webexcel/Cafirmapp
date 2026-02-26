import api from './client';
import { EP } from './endpoints';

export const masterApi = {
  // Services
  getServices: () =>
    api.get(`${EP.MASTER}/${EP.SERVICES}/getServices`),
  addService: (data: any) =>
    api.post(`${EP.MASTER}/${EP.SERVICES}/addService`, data),
  deleteService: (data: any) =>
    api.post(`${EP.MASTER}/${EP.SERVICES}/deleteService`, data),

  // Client Types
  getClientTypes: () =>
    api.get(`${EP.MASTER}/${EP.CLIENT_TYPE}/getClientType`),
  addClientType: (data: any) =>
    api.post(`${EP.MASTER}/${EP.CLIENT_TYPE}/addClientType`, data),
  editClientType: (data: any) =>
    api.post(`${EP.MASTER}/${EP.CLIENT_TYPE}/editClientType`, data),
  deleteClientType: (data: any) =>
    api.post(`${EP.MASTER}/${EP.CLIENT_TYPE}/deleteClientType`, data),

  // Document Types
  getDocumentTypes: () =>
    api.get(`${EP.MASTER}/${EP.DOCUMENTTYPE}/getDocumentType`),
  addDocumentType: (data: any) =>
    api.post(`${EP.MASTER}/${EP.DOCUMENTTYPE}/addDocumentType`, data),
  editDocumentType: (data: any) =>
    api.post(`${EP.MASTER}/${EP.DOCUMENTTYPE}/editDocumentType`, data),
  deleteDocumentType: (data: any) =>
    api.post(`${EP.MASTER}/${EP.DOCUMENTTYPE}/deleteDocumentType`, data),

  // Financial Years
  getYears: () =>
    api.get(`${EP.MASTER}/${EP.YEAR}/getYearList`),
  addYear: (data: any) =>
    api.post(`${EP.MASTER}/${EP.YEAR}/addYear`, data),
  editYear: (data: any) =>
    api.post(`${EP.MASTER}/${EP.YEAR}/editYear`, data),
  deleteYear: (data: any) =>
    api.post(`${EP.MASTER}/${EP.YEAR}/deleteYear`, data),
};
