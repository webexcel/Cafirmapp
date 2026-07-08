import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import EmptyState from '../../../components/EmptyState';
import { useAttendance } from '../hooks/useAttendance';
import { formatDateToYYYYMMDD } from '../../../utils/dateFormat';

const ActivityTrackerScreen: React.FC = () => {
  const today = formatDateToYYYYMMDD(new Date());
  const { records } = useAttendance(today);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={[styles.cell, styles.snoCell]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.timeCell]}>{item.login_time || '-'}</Text>
      <Text style={[styles.cell, styles.timeCell]}>{item.logout_time || '-'}</Text>
      <Text style={[styles.cell, styles.minCell]}>{item.total_minutes || '0'}</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Activity Tracker" />

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.snoCell]}>#</Text>
        <Text style={[styles.headerCell, styles.timeCell]}>Start Time</Text>
        <Text style={[styles.headerCell, styles.timeCell]}>End Time</Text>
        <Text style={[styles.headerCell, styles.minCell]}>Minutes</Text>
      </View>

      <FlatList
        data={records.data || []}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={records.isRefetching}
        onRefresh={() => records.refetch()}
        ListEmptyComponent={
          records.isLoading ? null : <EmptyState icon="calendar-blank-outline" title="No records" subtitle="No attendance records for today" />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  tableHeader: {
    flexDirection: 'row', backgroundColor: colors.primary,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  headerCell: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  snoCell: { width: 40, textAlign: 'center' },
  timeCell: { flex: 1, textAlign: 'center' },
  minCell: { width: 70, textAlign: 'center' },
  listContent: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowEven: { backgroundColor: colors.surface },
  cell: { fontSize: 13, color: colors.text },
});

export default ActivityTrackerScreen;
