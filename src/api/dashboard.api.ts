import api from './client';
import { EP } from './endpoints';

export const dashboardApi = {
  getDashboard: () =>
    api.get(`${EP.DASHBOARD}/getDashboardData`),
};
