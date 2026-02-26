import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timesheetApi } from '../../../api/timesheet.api';
import Toast from 'react-native-toast-message';

export const useTimesheets = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['timesheets'],
    queryFn: async () => {
      const res = await timesheetApi.getAll();
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => timesheetApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timesheets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      Toast.show({ type: 'success', text1: 'Timesheet added' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Add failed' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (timesheet_id: number) => timesheetApi.delete({ timesheet_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timesheets'] });
      Toast.show({ type: 'success', text1: 'Timesheet deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Delete failed' }),
  });

  return { list, addMutation, deleteMutation };
};
