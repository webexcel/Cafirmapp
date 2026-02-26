import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../../api/dashboard.api';
import { taskApi } from '../../../api/task.api';
import { timesheetApi } from '../../../api/timesheet.api';

export const useDashboard = () => {
  const metrics = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data.data;
    },
  });

  const recentTasks = useQuery({
    queryKey: ['dashboard', 'latestTasks'],
    queryFn: async () => {
      const res = await taskApi.getLatest();
      return res.data.data;
    },
  });

  const recentTimesheets = useQuery({
    queryKey: ['dashboard', 'limitedTimesheets'],
    queryFn: async () => {
      const res = await timesheetApi.getLimited();
      return res.data.data;
    },
  });

  return { metrics, recentTasks, recentTimesheets };
};
