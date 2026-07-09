import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme';
import { SCREEN } from '../../../constants/routes';
import AppHeader from '../../../components/AppHeader';
import OverlayLoader from '../../../components/OverlayLoader';
import { SectionCard, TimesheetRow } from '../../../components/three60';
import { useTimesheets } from '../hooks/useTimesheet';
import { employeeApi } from '../../../api/employee.api';
import { taskApi } from '../../../api/task.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { formatDateToYYYYMMDD } from '../../../utils/dateFormat';

const schema = yup.object({
  employee: yup.string().required('Employee is required'),
  task: yup.string().required('Task is required'),
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
});

const AddTimesheetScreen: React.FC = () => {
  const { addMutation, list } = useTimesheets();
  const navigation = useNavigation<any>();
  const user = useSelector((s: RootState) => s.auth.user);

  // Admins/managers (role 1 or 2) see everyone's data; ordinary employees see
  // only their own. Matches the backend getEmployeesByPermission rule.
  const isPrivileged = user?.role === 1 || user?.role === 2;

  // Last 20 added timesheets, most recent first (scoped by role).
  const recent = React.useMemo(() => {
    let rows = [...(list.data || [])];
    if (!isPrivileged) {
      rows = rows.filter((r: any) => String(r.employee_id) === String(user?.employee_id));
    }
    rows.sort((a, b) => {
      const av = a.created_at || a.time_sheet_id || a.timesheet_id || 0;
      const bv = b.created_at || b.time_sheet_id || b.timesheet_id || 0;
      return av < bv ? 1 : av > bv ? -1 : 0;
    });
    return rows.slice(0, 20);
  }, [list.data, isPrivileged, user?.employee_id]);

  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState('');

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      employee: user?.employee_id ? String(user.employee_id) : '',
      task: '',
      date: formatDateToYYYYMMDD(new Date()),
      time: '',
    },
  });

  const watchEmployee = watch('employee');

  useEffect(() => {
    employeeApi.getByPermission({ emp_id: user?.employee_id })
      .then((r) => setEmployees(r.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (watchEmployee) {
      taskApi.getByClient({ client_id: Number(watchEmployee) })
        .then((r) => setTasks(r.data.data || []))
        .catch(() => setTasks([]));
    }
  }, [watchEmployee]);

  const selectedEmp = employees.find((e) => String(e.employee_id) === watchEmployee);
  const selectedTask = tasks.find((t) => String(t.task_id) === watch('task'));

  const onSubmit = (data: any) => {
    addMutation.mutate(
      { emp_id: data.employee, task_id: data.task, date: data.date, time: data.time },
      { onSuccess: () => reset({ employee: String(user?.employee_id || ''), task: '', date: formatDateToYYYYMMDD(new Date()), time: '' }) },
    );
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Add Timesheet" />
      <OverlayLoader visible={addMutation.isPending} />

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Employee */}
        <Text style={styles.label}>Employee *</Text>
        <Menu
          visible={menuVisible === 'emp'}
          onDismiss={() => setMenuVisible('')}
          anchor={
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.dropdownInput, errors.employee && { borderColor: colors.error }]}
              onPress={() => setMenuVisible('emp')}>
              <Text style={[styles.dropdownText, !selectedEmp && { color: colors.disabled }]}>
                {selectedEmp?.name || 'Select employee'}
              </Text>
            </TouchableOpacity>
          }
        >
          {employees.map((e: any) => (
            <Menu.Item key={e.employee_id} title={e.name}
              onPress={() => { setValue('employee', String(e.employee_id), { shouldValidate: true }); setMenuVisible(''); }} />
          ))}
        </Menu>
        {errors.employee && <Text style={styles.error}>{errors.employee.message}</Text>}

        {/* Task */}
        <Text style={styles.label}>Task *</Text>
        <Menu
          visible={menuVisible === 'task'}
          onDismiss={() => setMenuVisible('')}
          anchor={
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.dropdownInput, errors.task && { borderColor: colors.error }]}
              onPress={() => setMenuVisible('task')}>
              <Text style={[styles.dropdownText, !selectedTask && { color: colors.disabled }]}>
                {selectedTask ? `${selectedTask.task_name} - ${selectedTask.year_name || ''}` : 'Select task'}
              </Text>
            </TouchableOpacity>
          }
        >
          {tasks.map((t: any) => (
            <Menu.Item key={t.task_id} title={`${t.task_name} - ${t.year_name || ''}`}
              onPress={() => { setValue('task', String(t.task_id), { shouldValidate: true }); setMenuVisible(''); }} />
          ))}
        </Menu>
        {errors.task && <Text style={styles.error}>{errors.task.message}</Text>}

        {/* Date */}
        <Text style={styles.label}>Date *</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <TextInput mode="outlined" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange}
              outlineColor={errors.date ? colors.error : colors.border}
              activeOutlineColor={colors.primary} style={styles.input} outlineStyle={styles.outline} />
          )}
        />
        {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}

        {/* Time */}
        <Text style={styles.label}>Time (HH:MM) *</Text>
        <Controller
          control={control}
          name="time"
          render={({ field: { onChange, value } }) => (
            <TextInput mode="outlined" placeholder="e.g. 02:30" value={value} onChangeText={onChange}
              keyboardType="numbers-and-punctuation"
              outlineColor={errors.time ? colors.error : colors.border}
              activeOutlineColor={colors.primary} style={styles.input} outlineStyle={styles.outline} />
          )}
        />
        {errors.time && <Text style={styles.error}>{errors.time.message}</Text>}

        <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.submitBtn}
          contentStyle={{ height: 48 }} labelStyle={{ fontWeight: '600' }}>
          Add Timesheet
        </Button>

        <Button mode="outlined" icon="calendar-week"
          onPress={() => navigation.navigate(SCREEN.VIEW_TIMESHEET)}
          style={styles.weeklyBtn} contentStyle={{ height: 48 }}
          textColor={colors.primary} labelStyle={{ fontWeight: '600' }}>
          View Weekly Timesheet
        </Button>

        <View style={styles.recentSection}>
          <SectionCard
            title="Recent Timesheets"
            icon="clock-outline"
            count={recent.length}
            empty={recent.length === 0}
            emptyText={list.isLoading ? 'Loading…' : 'No timesheets added yet'}
          >
            {recent.map((t: any, i: number) => (
              <TimesheetRow key={t.time_sheet_id ?? t.timesheet_id ?? i} ts={t} showEmployee />
            ))}
          </SectionCard>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.surface, fontSize: 14, height: 48 },
  outline: { borderRadius: 8 },
  error: { fontSize: 12, color: colors.error, marginTop: 4 },
  dropdownInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 14,
    minHeight: 48, justifyContent: 'center',
  },
  dropdownText: { fontSize: 14, color: colors.text },
  submitBtn: { marginTop: 24, borderRadius: 8, backgroundColor: colors.primary },
  weeklyBtn: { marginTop: 12, borderRadius: 8, borderColor: colors.primary },
  recentSection: { marginTop: 24 },
});

export default AddTimesheetScreen;
