import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { attendanceApi } from '../../../api/attendance.api';
import Toast from 'react-native-toast-message';
import type { RootState } from '../../../app/store';
import { isForbidden } from '../../../utils/permissionError';

interface ClockInParams {
  latitude?: number;
  longitude?: number;
  work_mode?: 'office' | 'remote';
}

interface ClockOutParams {
  att_id: number;
  latitude?: number;
  longitude?: number;
}

export const useAttendance = (date?: string) => {
  const qc = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  // Stop the 30s polling once we hit a 403 — the account lacks attendance
  // permission and retrying just spams the server (and the logs).
  const pollUnlessForbidden = (query: { state: { error: unknown } }) =>
    isForbidden(query.state.error) ? (false as const) : 30000;

  const records = useQuery({
    queryKey: ['attendance', date],
    queryFn: async () => {
      const res = await attendanceApi.getAttendance({ date: date! });
      return res.data.data;
    },
    enabled: !!date,
    refetchInterval: pollUnlessForbidden,
  });

  const todayCheck = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const res = await attendanceApi.checkToday({ emp_id: user!.employee_id });
      return res.data;
    },
    enabled: !!user?.employee_id,
    refetchInterval: pollUnlessForbidden,
  });

  // True when the account is not permitted to use attendance at all.
  const forbidden = isForbidden(records.error) || isForbidden(todayCheck.error);

  const clockIn = useMutation({
    mutationFn: (params?: ClockInParams) => {
      const now = new Date();
      return attendanceApi.login({
        emp_id: user!.employee_id,
        start_time: now.toTimeString().split(' ')[0],
        start_date: now.toISOString().split('T')[0],
        ...(params?.latitude != null && { latitude: params.latitude }),
        ...(params?.longitude != null && { longitude: params.longitude }),
        ...(params?.work_mode && { work_mode: params.work_mode }),
      });
    },
    onSuccess: (_res, params) => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      Toast.show({
        type: 'success',
        text1: 'Logged in',
        ...(params?.work_mode === 'remote' && { text2: 'Recorded as remote (off-site)' }),
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Unknown error';
      Toast.show({ type: 'error', text1: 'Login failed', text2: msg });
    },
  });

  const clockOut = useMutation({
    mutationFn: (params: ClockOutParams) => {
      const now = new Date();
      return attendanceApi.logout({
        att_id: params.att_id,
        logout_date: now.toISOString().split('T')[0],
        logout_time: now.toTimeString().split(' ')[0],
        ...(params.latitude != null && { latitude: params.latitude }),
        ...(params.longitude != null && { longitude: params.longitude }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      Toast.show({ type: 'success', text1: 'Logged out' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Unknown error';
      Toast.show({ type: 'error', text1: 'Logout failed', text2: msg });
    },
  });

  return { records, todayCheck, clockIn, clockOut, forbidden };
};

export const useAttendanceByDate = () => {
  const viewAttendance = useMutation({
    // emp_id is "" when an admin/manager requests every employee's attendance.
    mutationFn: (data: { emp_id: number | string; start_date: string; end_date: string; user_id: number }) =>
      attendanceApi.getByDate(data),
  });
  return { viewAttendance };
};
