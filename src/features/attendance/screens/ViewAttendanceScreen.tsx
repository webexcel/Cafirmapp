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
import { formatDateToYYYYMMDD } from '../../../utils/dateFormat';
import { TextInput } from 'react-native-paper';

const ViewAttendanceScreen: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const { viewAttendance } = useAttendanceByDate();

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [menuVisible, setMenuVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    employeeApi.getByPermission({ emp_id: user?.employee_id })
      .then((r) => {
        setEmployees(r.data.data || []);
        if (r.data.data?.length === 1) setSelectedEmp(String(r.data.data[0].employee_id));
      })
      .catch(() => {});
  }, []);

  const empName = employees.find((e) => String(e.employee_id) === selectedEmp)?.name || '';

  const handleSearch = () => {
    if (!selectedEmp || !startDate || !endDate) return;
    viewAttendance.mutate(
      { emp_id: Number(selectedEmp), start_date: startDate, end_date: endDate, user_id: user?.employee_id || 0 },
      { onSuccess: (res) => setData(res.data.data || []) },
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={[styles.cell, { width: 36 }]}>{index + 1}</Text>
      <Text style={[styles.cell, { flex: 1 }]} numberOfLines={1}>{item.employee_name}</Text>
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
          {employees.map((e: any) => (
            <Menu.Item key={e.employee_id} title={e.name}
              onPress={() => { setSelectedEmp(String(e.employee_id)); setMenuVisible(false); }} />
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
});

export default ViewAttendanceScreen;
