import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../../../theme';
import { RootState } from '../../../app/store';
import AppHeader from '../../../components/AppHeader';
import { StatRow, SectionCard, TaskRow, TimesheetRow, AttendanceRow } from '../../../components/three60';
import { sumDurationsToHHMM, formatDateToYYYYMMDD } from '../../../utils/dateFormat';
import { useEmployeeDetails } from '../hooks/useEmployees';
import { useTasks } from '../../task/hooks/useTasks';
import { useTimesheets } from '../../timesheet/hooks/useTimesheet';
import { attendanceApi } from '../../../api/attendance.api';

const MAX_ROWS = 25;
const ATTENDANCE_DAYS = 30;

const Employee360Screen: React.FC = () => {
  const route = useRoute<any>();
  const { id } = route.params;
  const user = useSelector((s: RootState) => s.auth.user);

  const { data, isLoading } = useEmployeeDetails(id);
  const { list: taskList } = useTasks({ emp_id: id });
  const { list: tsList } = useTimesheets();
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - ATTENDANCE_DAYS);
    attendanceApi
      .getByDate({
        emp_id: id,
        start_date: formatDateToYYYYMMDD(start),
        end_date: formatDateToYYYYMMDD(end),
        user_id: user?.employee_id || 0,
      })
      .then((r) => setAttendance(r.data.data || []))
      .catch(() => {});
  }, [id, user?.employee_id]);

  const tasks = taskList.data || [];
  const timesheets = useMemo(
    () => (tsList.data || []).filter((t: any) => String(t.employee_id) === String(id)),
    [tsList.data, id],
  );

  const stats = useMemo(
    () => [
      { label: 'Present', value: attendance.length, color: colors.accent },
      { label: 'Hours Logged', value: sumDurationsToHHMM(timesheets.map((t: any) => t.total_time)), color: colors.primary },
      { label: 'Tasks', value: tasks.length },
      { label: 'Completed', value: tasks.filter((t: any) => Number(t.status) === 2).length, color: colors.success },
    ],
    [attendance, timesheets, tasks],
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Employee 360" showBack showDrawer={false} />

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{data.name?.charAt(0)?.toUpperCase() || 'E'}</Text>
            </View>
            <Text style={styles.profileName}>{data.name}</Text>
            <Text style={styles.profileRole}>{data.permission_name || 'Employee'}</Text>
            {!!data.email && <Text style={styles.profileMeta}>{data.email}</Text>}
          </View>

          <StatRow items={stats} />

          <SectionCard
            title={`Attendance (last ${ATTENDANCE_DAYS} days)`}
            icon="calendar-check-outline"
            count={attendance.length}
            empty={attendance.length === 0}
            emptyText="No attendance records"
          >
            {attendance.slice(0, MAX_ROWS).map((a: any, i: number) => (
              <AttendanceRow key={i} att={a} />
            ))}
            {attendance.length > MAX_ROWS && (
              <Text style={styles.moreText}>+{attendance.length - MAX_ROWS} more</Text>
            )}
          </SectionCard>

          <SectionCard title="Timesheets" icon="clock-outline" count={timesheets.length} empty={timesheets.length === 0} emptyText="No timesheets">
            {timesheets.slice(0, MAX_ROWS).map((t: any, i: number) => (
              <TimesheetRow key={i} ts={t} />
            ))}
            {timesheets.length > MAX_ROWS && (
              <Text style={styles.moreText}>+{timesheets.length - MAX_ROWS} more</Text>
            )}
          </SectionCard>

          <SectionCard title="Tasks" icon="clipboard-check-outline" count={tasks.length} empty={tasks.length === 0} emptyText="No tasks assigned">
            {tasks.slice(0, MAX_ROWS).map((t: any) => (
              <TaskRow key={t.task_id} task={t} />
            ))}
            {tasks.length > MAX_ROWS && (
              <Text style={styles.moreText}>+{tasks.length - MAX_ROWS} more</Text>
            )}
          </SectionCard>
        </ScrollView>
      ) : (
        <View style={styles.loader}>
          <Text style={{ color: colors.textSecondary }}>Employee not found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 24,
    alignItems: 'center', marginBottom: 16,
  },
  avatarLarge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  avatarLargeText: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  profileName: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  profileRole: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  profileMeta: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  moreText: { fontSize: 12, color: colors.primary, fontWeight: '600', paddingTop: 10, textAlign: 'center' },
});

export default Employee360Screen;
