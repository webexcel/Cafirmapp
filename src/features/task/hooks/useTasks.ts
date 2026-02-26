import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../../api/task.api';
import Toast from 'react-native-toast-message';

export const useTasks = (filters?: any) => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const res = await taskApi.getViewTasks(filters || {});
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (task_id: number) => taskApi.delete({ task_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      Toast.show({ type: 'success', text1: 'Task deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Delete failed' }),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => taskApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      Toast.show({ type: 'success', text1: 'Task created' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Create failed' }),
  });

  const editMutation = useMutation({
    mutationFn: (data: any) => taskApi.edit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      Toast.show({ type: 'success', text1: 'Task updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Update failed' }),
  });

  const statusMutation = useMutation({
    mutationFn: (data: any) => taskApi.updateStatus(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      Toast.show({ type: 'success', text1: 'Status updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Update failed' }),
  });

  return { list, deleteMutation, addMutation, editMutation, statusMutation };
};
