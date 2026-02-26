import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import OverlayLoader from '../../../components/OverlayLoader';
import { useTasks } from '../hooks/useTasks';
import { clientApi } from '../../../api/clientMgmt.api';
import { taskApi } from '../../../api/task.api';
import { employeeApi } from '../../../api/employee.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { formatDateToYYYYMMDD } from '../../../utils/dateFormat';

const schema = yup.object({
  taskName: yup.string().required('Task name is required'),
  client: yup.string().required('Client is required'),
  service: yup.string().required('Service is required'),
  priority: yup.string().required('Priority is required'),
});

const priorities = ['Low', 'Medium', 'Critical'];

const CreateTaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addMutation } = useTasks();
  const user = useSelector((s: RootState) => s.auth.user);

  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [menuVisible, setMenuVisible] = useState<string>('');

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { taskName: '', client: '', service: '', priority: '' },
  });

  const watchClient = watch('client');
  const watchService = watch('service');

  useEffect(() => {
    clientApi.getAll().then((r) => setClients(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (watchClient) {
      taskApi.getServicesForTask({ client_id: watchClient })
        .then((r) => setServices(r.data.data || []))
        .catch(() => setServices([]));
      setValue('service', '');
      setSelectedEmployees([]);
    }
  }, [watchClient]);

  useEffect(() => {
    if (watchService) {
      employeeApi.getByPermission({ emp_id: user?.employee_id })
        .then((r) => setEmployees(r.data.data || []))
        .catch(() => setEmployees([]));
    }
  }, [watchService]);

  const selectedClient = clients.find((c) => String(c.client_id) === watchClient);
  const selectedService = services.find((s) => String(s.service_id || s.id) === watchService);
  const selectedPriority = watch('priority');

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const onSubmit = (data: any) => {
    const today = formatDateToYYYYMMDD(new Date());
    addMutation.mutate(
      {
        name: data.taskName,
        client: data.client,
        service: data.service,
        assignTo: selectedEmployees,
        assignDate: today,
        dueDate: today,
        priority: data.priority,
        description: '',
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  const DropdownField: React.FC<{
    label: string; menuKey: string; value: string; placeholder: string;
    items: { key: string; label: string }[]; onSelect: (v: string) => void; error?: string;
  }> = ({ label, menuKey, value, placeholder, items, onSelect, error }) => (
    <View>
      <Text style={styles.label}>{label} *</Text>
      <Menu
        visible={menuVisible === menuKey}
        onDismiss={() => setMenuVisible('')}
        anchor={
          <View style={[styles.dropdownInput, error ? { borderColor: colors.error } : null]}>
            <Text
              style={[styles.dropdownText, !value && { color: colors.disabled }]}
              onPress={() => setMenuVisible(menuKey)}
            >
              {value || placeholder}
            </Text>
          </View>
        }
      >
        {items.map((i) => (
          <Menu.Item key={i.key} title={i.label} onPress={() => { onSelect(i.key); setMenuVisible(''); }} />
        ))}
      </Menu>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Create Task" showBack showDrawer={false} />
      <OverlayLoader visible={addMutation.isPending} />

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Task Name *</Text>
        <Controller
          control={control}
          name="taskName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput mode="outlined" placeholder="Enter task name" value={value}
              onChangeText={onChange} onBlur={onBlur}
              outlineColor={errors.taskName ? colors.error : colors.border}
              activeOutlineColor={colors.primary} style={styles.input} outlineStyle={styles.outline} />
          )}
        />
        {errors.taskName && <Text style={styles.error}>{errors.taskName.message}</Text>}

        <DropdownField label="Client" menuKey="client" value={selectedClient?.display_name || selectedClient?.client_name || ''}
          placeholder="Select client" items={clients.map((c) => ({ key: String(c.client_id), label: c.display_name || c.client_name }))}
          onSelect={(v) => setValue('client', v, { shouldValidate: true })} error={errors.client?.message} />

        <DropdownField label="Service" menuKey="service" value={selectedService?.service_name || ''}
          placeholder="Select service" items={services.map((s) => ({ key: String(s.service_id || s.id), label: s.service_name }))}
          onSelect={(v) => setValue('service', v, { shouldValidate: true })} error={errors.service?.message} />

        <DropdownField label="Priority" menuKey="priority" value={selectedPriority}
          placeholder="Select priority" items={priorities.map((p) => ({ key: p, label: p }))}
          onSelect={(v) => setValue('priority', v, { shouldValidate: true })} error={errors.priority?.message} />

        {/* Employee Selection */}
        {employees.length > 0 && (
          <View>
            <Text style={styles.label}>Assign To</Text>
            <View style={styles.empGrid}>
              {employees.map((e: any) => (
                <View
                  key={e.employee_id}
                  style={[styles.empChip, selectedEmployees.includes(e.employee_id) && styles.empChipActive]}
                >
                  <Text
                    style={[styles.empChipText, selectedEmployees.includes(e.employee_id) && { color: '#FFF' }]}
                    onPress={() => toggleEmployee(e.employee_id)}
                  >
                    {e.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.submitBtn}
          contentStyle={{ height: 48 }} labelStyle={{ fontWeight: '600' }}>
          Create Task
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  form: { padding: 20, paddingBottom: 40 },
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
  empGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  empChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  empChipText: { fontSize: 13, color: colors.text },
  submitBtn: { marginTop: 24, borderRadius: 8, backgroundColor: colors.primary },
});

export default CreateTaskScreen;
