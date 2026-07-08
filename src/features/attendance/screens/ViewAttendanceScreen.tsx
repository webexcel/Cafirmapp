import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import EmptyState from '../../../components/EmptyState';
import OverlayLoader from '../../../components/OverlayLoader';
import { useAttendanceByDate } from '../hooks/useAttendance';
import { employeeApi } from '../../../api/employee.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { formatDateToYYYYMMDD, formatDate } from '../../../utils/dateFormat';
import DatePickerField from '../../../components/DatePickerField';

// Sentinel for the admin/manager "see everyone" option.
const ALL_EMPLOYEES = 'ALL';

const ViewAttendanceScreen: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const { viewAttendance } = useAttendanceByDate();

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [menuVisible, setMenuVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);

  // Only superadmin (role 1) and admin (role 2) may view every employee's
  // attendance. Matches the backend `isAdmin = role == 1 || role == 2` rule.
  const isAdminView = user?.role === 1 || user?.role === 2;

  const runSearch = (emp: string) => {
    if (!emp) return;
    const from = startDate;
    const to = endDate;
    viewAttendance.mutate(
      {
        // "" tells the backend to return every employee (admin/manager only).
        emp_id: emp === ALL_EMPLOYEES ? '' : Number(emp),
        start_date: from,
        end_date: to,
        user_id: user?.employee_id || 0,
      },
      {
        onSuccess: (res) => {
          // The API filters on created_at, which can leak a record whose
          // login_date is an adjacent day. Keep only rows whose attendance
          // date (login_date) is within the selected range, so the table
          // matches the pickers — today only on the default load.
          const rows = res.data.data || [];
          const filtered = rows.filter(
            (r: any) => !r.login_date || (r.login_date >= from && r.login_date <= to),
          );
          setData(filtered);
        },
      },
    );
  };

  useEffect(() => {
    employeeApi.getByPermission({ emp_id: user?.employee_id ?? 0 })
      .then((r) => {
        const list = r.data.data || [];
        setEmployees(list);
        // Admins/superadmins default to the combined "All Employees" view;
        // everyone else is scoped to their own attendance.
        const initial = isAdminView ? ALL_EMPLOYEES : String(user?.employee_id ?? '');
        setSelectedEmp(initial);
        runSearch(initial);
      })
      .catch(() => {});
  }, []);

  const empName =
    selectedEmp === ALL_EMPLOYEES
      ? 'All Employees'
      : employees.find((e) => String(e.employee_id) === selectedEmp)?.name || '';

  const handleSearch = () => runSearch(selectedEmp);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={[styles.cell, { width: 36 }]}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cell} numberOfLines={1}>{item.employee_name}</Text>
        {!!item.login_date && <Text style={styles.dateSub}>{formatDate(item.login_date)}</Text>}
        {item.work_mode === 'remote' && <Text style={styles.remoteTag}>REMOTE</Text>}
      </View>
      <Text style={[styles.cell, { width: 70 }]}>{item.login_time || '-'}</Text>
      <Text style={[styles.cell, { width: 70 }]}>{item.logout_time || '-'}</Text>
      <Text style={[styles.cell, { width: 60 }]}>{item.total_time || '0'}</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="View Attendance" showBack showDrawer={false} />
      <OverlayLoader visible={viewAttendance.isPending} />

      <View style={styles.filterSection}>
        {/* Employee Dropdown */}
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
          {isAdminView && (
            <Menu.Item key={ALL_EMPLOYEES} title="All Employees"
              onPress={() => { setSelectedEmp(ALL_EMPLOYEES); setMenuVisible(false); }} />
          )}
          {employees.map((e: any) => (
            <Menu.Item key={e.employee_id} title={e.name}
              onPress={() => { setSelectedEmp(String(e.employee_id)); setMenuVisible(false); }} />
          ))}
        </Menu>

        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start Date</Text>
            <DatePickerField value={startDate} onChange={setStartDate} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>End Date</Text>
            <DatePickerField value={endDate} onChange={setEndDate} />
          </View>
        </View>

        <Button mode="contained" onPress={handleSearch} style={styles.searchBtn}
          contentStyle={{ height: 42 }} icon="magnify">
          Search
        </Button>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { width: 36 }]}>#</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Name</Text>
        <Text style={[styles.headerCell, { width: 70 }]}>In</Text>
        <Text style={[styles.headerCell, { width: 70 }]}>Out</Text>
        <Text style={[styles.headerCell, { width: 60 }]}>Total</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="calendar-blank-outline" title="No records" subtitle="Select employee and dates, then search" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  filterSection: { backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4, marginTop: 8 },
  dropdownInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface,
    paddingHorizontal: 12, paddingVertical: 12, minHeight: 44,
  },
  dropdownText: { fontSize: 14, color: colors.text },
  dateRow: { flexDirection: 'row', marginTop: 4 },
  dateInput: { backgroundColor: colors.surface, fontSize: 13, height: 44 },
  outline: { borderRadius: 8 },
  searchBtn: { marginTop: 12, borderRadius: 8, backgroundColor: colors.primary },
  tableHeader: {
    flexDirection: 'row', backgroundColor: colors.primary,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  headerCell: { color: '#FFF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  listContent: { paddingHorizontal: 12 },
  row: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowEven: { backgroundColor: colors.surface },
  cell: { fontSize: 12, color: colors.text, textAlign: 'center' },
  dateSub: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  remoteTag: {
    fontSize: 9, fontWeight: '700', color: colors.error, textAlign: 'center',
    marginTop: 2, letterSpacing: 0.5,
  },
});

export default ViewAttendanceScreen;
