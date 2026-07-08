import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import { SCREEN } from '../../../constants/routes';
import { StatRow, SectionCard, TaskRow, TimesheetRow } from '../../../components/three60';
import { sumDurationsToHHMM } from '../../../utils/dateFormat';
import { useClientDetails } from '../hooks/useClients';
import { useTasks } from '../../task/hooks/useTasks';
import { useTimesheets } from '../../timesheet/hooks/useTimesheet';

const MAX_ROWS = 25;

const Field: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.field}>
    <Icon name={icon} size={20} color={colors.accent} style={{ marginRight: 14 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const ClientProfileScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const { data, isLoading } = useClientDetails(id);
  const { list: taskList } = useTasks({ client_id: id });
  const { list: tsList } = useTimesheets();

  const tasks = taskList.data || [];
  const taskIds = useMemo(() => new Set(tasks.map((t: any) => t.task_id)), [tasks]);
  const timesheets = useMemo(
    () => (tsList.data || []).filter((t: any) => taskIds.has(t.task_id)),
    [tsList.data, taskIds],
  );

  const stats = useMemo(
    () => [
      { label: 'Tasks', value: tasks.length },
      { label: 'Pending', value: tasks.filter((t: any) => Number(t.status) === 0).length, color: colors.warning },
      { label: 'In Progress', value: tasks.filter((t: any) => Number(t.status) === 1).length, color: colors.accent },
      { label: 'Completed', value: tasks.filter((t: any) => Number(t.status) === 2).length, color: colors.success },
      { label: 'Hours Logged', value: sumDurationsToHHMM(timesheets.map((t: any) => t.total_time)), color: colors.primary },
    ],
    [tasks, timesheets],
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Client 360" showBack showDrawer={false} />

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Icon name="domain" size={32} color="#FFF" />
            </View>
            <Text style={styles.profileName}>{data.display_name || data.client_name}</Text>
            <Text style={styles.profileType}>{data.client_type || 'Client'}</Text>
          </View>

          <StatRow items={stats} />

          <SectionCard title="Tasks" icon="clipboard-check-outline" count={tasks.length} empty={tasks.length === 0} emptyText="No tasks for this client">
            {tasks.slice(0, MAX_ROWS).map((t: any) => (
              <TaskRow
                key={t.task_id}
                task={t}
                onPress={() => navigation.navigate(SCREEN.TASK_DETAIL, { task: t })}
              />
            ))}
            {tasks.length > MAX_ROWS && (
              <Text style={styles.moreText}>+{tasks.length - MAX_ROWS} more</Text>
            )}
          </SectionCard>

          <SectionCard title="Timesheets" icon="clock-outline" count={timesheets.length} empty={timesheets.length === 0} emptyText="No timesheets for this client">
            {timesheets.slice(0, MAX_ROWS).map((t: any, i: number) => (
              <TimesheetRow key={i} ts={t} showEmployee />
            ))}
            {timesheets.length > MAX_ROWS && (
              <Text style={styles.moreText}>+{timesheets.length - MAX_ROWS} more</Text>
            )}
          </SectionCard>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Contact Details</Text>
            <Field icon="badge-account-outline" label="Client ID" value={String(data.client_id)} />
            <Field icon="account-outline" label="Contact Person" value={data.contact_person} />
            <Field icon="email-outline" label="Email" value={data.email} />
            <Field icon="phone-outline" label="Phone" value={data.phone} />
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Tax Details</Text>
            <Field icon="file-document-outline" label="GSTIN" value={data.gst_number} />
            <Field icon="card-account-details-outline" label="PAN" value={data.pan_number} />
            <Field icon="file-certificate-outline" label="TAN" value={data.tan_number} />
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Field icon="map-marker-outline" label="Address" value={data.address} />
            <Field icon="city-variant-outline" label="City" value={data.city} />
            <Field icon="flag-outline" label="State" value={data.state} />
            <Field icon="earth" label="Country" value={data.country} />
            <Field icon="mailbox-outline" label="Pincode" value={data.pincode} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loader}>
          <Text style={{ color: colors.textSecondary }}>Client not found</Text>
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
  profileName: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  profileType: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  detailsCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    marginBottom: 12, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  field: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  fieldLabel: { fontSize: 11, color: colors.textSecondary },
  fieldValue: { fontSize: 14, fontWeight: '500', color: colors.text, marginTop: 1 },
  moreText: { fontSize: 12, color: colors.primary, fontWeight: '600', paddingTop: 10, textAlign: 'center' },
});

export default ClientProfileScreen;
