import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import SearchBar from '../../../components/SearchBar';
import EmptyState from '../../../components/EmptyState';
import { useTimesheets } from '../hooks/useTimesheet';
import { formatDate } from '../../../utils/dateFormat';

const ViewTimesheetScreen: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const { list } = useTimesheets();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!list.data) return [];
    if (!search.trim()) return list.data;
    const q = search.toLowerCase();
    return list.data.filter((t: any) =>
      [t.employee_name, t.task_name, t.year_name]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(q)),
    );
  }, [list.data, search]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Icon name="clock-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.empName} numberOfLines={1}>{item.employee_name}</Text>
          <Text style={styles.taskName} numberOfLines={1}>{item.task_name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{item.year_name}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>{formatDate(item.date)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.timeBox}>
        <Text style={styles.time}>{item.total_time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.flex}>
      {!embedded && <AppHeader title="View Timesheet" showBack showDrawer={false} />}
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search timesheets..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={list.isRefetching}
        onRefresh={() => list.refetch()}
        ListEmptyComponent={
          list.isLoading ? null : <EmptyState icon="clock-off-outline" title="No timesheets found" />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  searchContainer: { padding: 16, paddingBottom: 0 },
  listContent: { padding: 16, paddingTop: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: colors.accent + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardContent: { flex: 1 },
  empName: { fontSize: 14, fontWeight: '600', color: colors.text },
  taskName: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { fontSize: 11, color: colors.disabled },
  metaDot: { fontSize: 11, color: colors.disabled, marginHorizontal: 4 },
  timeBox: {
    backgroundColor: colors.primary + '10', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8,
  },
  time: { fontSize: 13, fontWeight: '700', color: colors.primary },
});

export default ViewTimesheetScreen;
