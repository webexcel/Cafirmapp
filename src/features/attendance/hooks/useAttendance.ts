import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../../api/attendance.api';
import Toast from 'react-native-toast-message';

export const useAttendance = (date?: string) => {
  const qc = useQueryClient();

  const records = useQuery({
    queryKey: ['attendance', date],
    queryFn: async () => {
      const res = await attendanceApi.getAttendance({ date: date! });
      return res.data.data;
    },
    enabled: !!date,
  });

  const todayCheck = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const res = await attendanceApi.checkToday();
      return res.data;
    },
  });

  const clockIn = useMutation({
    mutationFn: () => attendanceApi.login(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      Toast.show({ type: 'success', text1: 'Clocked in' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Clock in failed' }),
  });

  const clockOut = useMutation({
    mutationFn: () => attendanceApi.logout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      Toast.show({ type: 'success', text1: 'Clocked out' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Clock out failed' }),
  });

  return { records, todayCheck, clockIn, clockOut };
};

export const useAttendanceByDate = () => {
  const viewAttendance = useMutation({
    mutationFn: (data: { emp_id: number; start_date: string; end_date: string; user_id: number }) =>
      attendanceApi.getByDate(data),
  });
  return { viewAttendance };
};
