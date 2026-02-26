import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '../../../api/reports.api';

export const useEmployeeReport = () => {
  const monthly = useMutation({
    mutationFn: (data: any) => reportsApi.employeeMonthly(data),
  });
  const weekly = useMutation({
    mutationFn: (data: any) => reportsApi.employeeWeekly(data),
  });
  const yearly = useMutation({
    mutationFn: (data: any) => reportsApi.employeeYearly(data),
  });
  const daily = useMutation({
    mutationFn: (data: any) => reportsApi.employeeDaily(data),
  });
  return { monthly, weekly, yearly, daily };
};

export const useClientReport = () => {
  const report = useMutation({
    mutationFn: (data: any) => reportsApi.clientDatewise(data),
  });
  return { report };
};
