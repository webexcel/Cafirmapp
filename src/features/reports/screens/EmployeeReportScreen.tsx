import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Button, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import MetricCard from '../../../components/MetricCard';
import EmptyState from '../../../components/EmptyState';
import OverlayLoader from '../../../components/OverlayLoader';
import { useEmployeeReport } from '../hooks/useReports';
import { employeeApi } from '../../../api/employee.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

const EmployeeReportScreen: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const { monthly } = useEmployeeReport();

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    employeeApi.getByPermission({ emp_id: user?.employee_id })
      .then((r) => setEmployees(r.data.data || []))
      .catch(() => {});
  }, []);

  const empName = employees.find((e) => String(e.employee_id) === selectedEmp)?.name || '';

  const handleGenerate = () => {
    if (!selectedEmp) return;
    const now = new Date();
    monthly.mutate(
      { emp_id: selectedEmp, month: now.getMonth() + 1, year: now.getFullYear() },
      { onSuccess: (res) => setReportData(res.data.data) },
    );
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Employee Report" showBack />
      <OverlayLoader visible={monthly.isPending} />

      <View style={styles.filterSection}>
        <Text style={styles.label}>Employee</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <View style={styles.dropdownInput}>
              <Text style={[styles.dropdownText, !empName && { color: colors.disabled }]}
                onPress={() => setMenuVisible(true)}>
                {empName || 'Select employee'}
              </Text>
            </View>
          }
        >
          {employees.map((e: any) => (
            <Menu.Item key={e.employee_id} title={e.name}
              onPress={() => { setSelectedEmp(String(e.employee_id)); setMenuVisible(false); }} />
          ))}
        </Menu>
        <Button mode="contained" onPress={handleGenerate} style={styles.genBtn}
          contentStyle={{ height: 42 }} icon="chart-bar">
          Generate Report
        </Button>
      </View>

      {reportData ? (
        <ScrollView contentContainerStyle={styles.reportContent}>
          {/* Summary Metrics */}
          <View style={styles.metricsRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <MetricCard title="Total Tasks" value={reportData.total_tasks || 0} icon="clipboard-list-outline" color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 6 }}>
              <MetricCard title="Pending" value={reportData.pending || 0} icon="clock-alert-outline" color={colors.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <MetricCard title="Completed" value={reportData.completed || 0} icon="check-circle-outline" color={colors.success} />
            </View>
          </View>

          {/* Task List */}
          {reportData.tasks && reportData.tasks.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              {reportData.tasks.map((t: any, i: number) => (
                <View key={i} style={styles.taskItem}>
                  <View style={styles.taskDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskName}>{t.task_name}</Text>
                    <Text style={styles.taskMeta}>{t.client_name} • {t.total_time || '0:00'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="chart-line" title="No tasks" subtitle="No task data available for this period" />
          )}
        </ScrollView>
      ) : (
        <EmptyState icon="chart-bar" title="Select an employee" subtitle="Choose an employee and generate report" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  filterSection: { backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 },
  dropdownInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  dropdownText: { fontSize: 14, color: colors.text },
  genBtn: { marginTop: 12, borderRadius: 8, backgroundColor: colors.primary },
  reportContent: { padding: 16 },
  metricsRow: { flexDirection: 'row', marginBottom: 16 },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  taskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginRight: 12 },
  taskName: { fontSize: 14, fontWeight: '500', color: colors.text },
  taskMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default EmployeeReportScreen;
