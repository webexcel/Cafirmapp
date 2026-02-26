import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import OverlayLoader from '../../../components/OverlayLoader';
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
  const { addMutation } = useTimesheets();
  const user = useSelector((s: RootState) => s.auth.user);

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
            <View style={[styles.dropdownInput, errors.employee && { borderColor: colors.error }]}>
              <Text style={[styles.dropdownText, !selectedEmp && { color: colors.disabled }]}
                onPress={() => setMenuVisible('emp')}>
                {selectedEmp?.name || 'Select employee'}
              </Text>
            </View>
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
            <View style={[styles.dropdownInput, errors.task && { borderColor: colors.error }]}>
              <Text style={[styles.dropdownText, !selectedTask && { color: colors.disabled }]}
                onPress={() => setMenuVisible('task')}>
                {selectedTask ? `${selectedTask.task_name} - ${selectedTask.year_name || ''}` : 'Select task'}
              </Text>
            </View>
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
});

export default AddTimesheetScreen;
