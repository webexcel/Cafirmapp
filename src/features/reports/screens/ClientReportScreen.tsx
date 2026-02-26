import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Menu, TextInput } from 'react-native-paper';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import MetricCard from '../../../components/MetricCard';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import OverlayLoader from '../../../components/OverlayLoader';
import { useClientReport } from '../hooks/useReports';
import { clientApi } from '../../../api/clientMgmt.api';
import { formatDateToYYYYMMDD } from '../../../utils/dateFormat';

const ClientReportScreen: React.FC = () => {
  const { report } = useClientReport();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    clientApi.getAll().then((r) => setClients(r.data.data || [])).catch(() => {});
  }, []);

  const clientName = clients.find((c) => String(c.client_id) === selectedClient)?.display_name || '';

  const handleGenerate = () => {
    if (!selectedClient) return;
    report.mutate(
      { client_id: selectedClient, start_date: startDate, end_date: endDate },
      { onSuccess: (res) => setReportData(res.data.data) },
    );
  };

  const getStatusKey = (status: number) => {
    if (status === 0) return 'pending';
    if (status === 1) return 'inprogress';
    return 'completed';
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Client Report" showBack />
      <OverlayLoader visible={report.isPending} />

      <View style={styles.filterSection}>
        <Text style={styles.label}>Client</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <View style={styles.dropdownInput}>
              <Text style={[styles.dropdownText, !clientName && { color: colors.disabled }]}
                onPress={() => setMenuVisible(true)}>
                {clientName || 'Select client'}
              </Text>
            </View>
          }
        >
          {clients.map((c: any) => (
            <Menu.Item key={c.client_id} title={c.display_name || c.client_name}
              onPress={() => { setSelectedClient(String(c.client_id)); setMenuVisible(false); }} />
          ))}
        </Menu>

        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput mode="outlined" value={startDate} onChangeText={setStartDate}
              placeholder="YYYY-MM-DD" style={styles.dateInput} outlineStyle={styles.outline} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>End Date</Text>
            <TextInput mode="outlined" value={endDate} onChangeText={setEndDate}
              placeholder="YYYY-MM-DD" style={styles.dateInput} outlineStyle={styles.outline} />
          </View>
        </View>

        <Button mode="contained" onPress={handleGenerate} style={styles.genBtn}
          contentStyle={{ height: 42 }} icon="chart-bar">
          Generate Report
        </Button>
      </View>

      {reportData ? (
        <ScrollView contentContainerStyle={styles.reportContent}>
          <View style={styles.metricsRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <MetricCard title="Total" value={reportData.total_tasks || 0} icon="clipboard-list-outline" color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 6 }}>
              <MetricCard title="Pending" value={reportData.pending || 0} icon="clock-alert-outline" color={colors.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <MetricCard title="Done" value={reportData.completed || 0} icon="check-circle-outline" color={colors.success} />
            </View>
          </View>

          {reportData.tasks && reportData.tasks.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              {reportData.tasks.map((t: any, i: number) => (
                <View key={i} style={styles.taskItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskName}>{t.task_name}</Text>
                    <Text style={styles.taskMeta}>{t.description || ''}</Text>
                  </View>
                  <StatusBadge status={getStatusKey(t.status)} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="chart-line" title="No tasks" />
          )}
        </ScrollView>
      ) : (
        <EmptyState icon="chart-bar" title="Select a client" subtitle="Choose a client and date range to generate report" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  filterSection: { backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4, marginTop: 8 },
  dropdownInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  dropdownText: { fontSize: 14, color: colors.text },
  dateRow: { flexDirection: 'row', marginTop: 4 },
  dateInput: { backgroundColor: colors.surface, fontSize: 13, height: 44 },
  outline: { borderRadius: 8 },
  genBtn: { marginTop: 12, borderRadius: 8, backgroundColor: colors.primary },
  reportContent: { padding: 16, paddingBottom: 32 },
  metricsRow: { flexDirection: 'row', marginBottom: 16 },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  taskItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  taskName: { fontSize: 14, fontWeight: '500', color: colors.text },
  taskMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default ClientReportScreen;
