import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import StatusBadge from '../../../components/StatusBadge';
import { formatDate } from '../../../utils/dateFormat';

const getStatusKey = (status: number) => {
  if (status === 0) return 'pending';
  if (status === 1) return 'inprogress';
  return 'completed';
};

const Field: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.field}>
    <Icon name={icon} size={20} color={colors.accent} style={{ marginRight: 14 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const TaskDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const task = route.params?.task;

  if (!task) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Task Detail" showBack showDrawer={false} />
        <View style={styles.loader}>
          <Text style={{ color: colors.textSecondary }}>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title="Task Detail" showBack showDrawer={false} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.taskName}>{task.task_name}</Text>
          <View style={styles.badges}>
            <StatusBadge status={getStatusKey(task.status)} />
            {task.priority && (
              <StatusBadge status={task.priority.toLowerCase()} label={task.priority} />
            )}
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Field icon="domain" label="Client" value={task.client_name} />
          <Field icon="cog-outline" label="Service" value={task.service_name} />
          <Field icon="calendar-outline" label="Assigned Date" value={formatDate(task.assigned_date)} />
          <Field icon="calendar-clock-outline" label="Due Date" value={formatDate(task.due_date)} />
          <Field icon="clock-outline" label="Total Time" value={task.total_time || '0:00'} />
          <Field icon="calendar-text-outline" label="Financial Year" value={task.year_name} />
        </View>

        {/* Assigned Employees */}
        {task.assignTo && task.assignTo.length > 0 && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Assigned To</Text>
            {task.assignTo.map((emp: any, i: number) => (
              <View key={i} style={styles.empRow}>
                <View style={styles.empAvatar}>
                  <Text style={styles.empAvatarText}>{emp.emp_name?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <Text style={styles.empName}>{emp.emp_name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  taskName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
  badges: { flexDirection: 'row', gap: 8 },
  detailsCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  field: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  fieldLabel: { fontSize: 11, color: colors.textSecondary },
  fieldValue: { fontSize: 14, fontWeight: '500', color: colors.text, marginTop: 1 },
  empRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  empAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  empAvatarText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  empName: { fontSize: 14, fontWeight: '500', color: colors.text },
});

export default TaskDetailScreen;
