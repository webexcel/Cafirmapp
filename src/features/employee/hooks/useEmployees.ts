import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../../../api/employee.api';
import Toast from 'react-native-toast-message';

export const useEmployees = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await employeeApi.getAll();
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeApi.delete({ employee_id: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      Toast.show({ type: 'success', text1: 'Employee deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Delete failed' }),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => employeeApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      Toast.show({ type: 'success', text1: 'Employee added' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Add failed' }),
  });

  const editMutation = useMutation({
    mutationFn: (data: any) => employeeApi.edit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      Toast.show({ type: 'success', text1: 'Employee updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Update failed' }),
  });

  return { list, deleteMutation, addMutation, editMutation };
};

export const useEmployeeDetails = (id: number) =>
  useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const res = await employeeApi.getDetails({ id });
      return res.data.data?.[0] || null;
    },
    enabled: !!id,
  });
