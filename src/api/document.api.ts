import api from './client';
import { EP } from './endpoints';

export const documentApi = {
  getAll: () =>
    api.get(`${EP.DOCUMENT}/getDocuments`),

  add: (data: any) =>
    api.post(`${EP.DOCUMENT}/addDocument`, data),

  delete: (data: { document_id: number }) =>
    api.post(`${EP.DOCUMENT}/deleteDocument`, data),
};
