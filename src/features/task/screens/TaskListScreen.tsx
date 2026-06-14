import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, IconButton, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import { SCREEN } from '../../../constants/routes';
import AppHeader from '../../../components/AppHeader';
import SearchBar from '../../../components/SearchBar';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import OverlayLoader from '../../../components/OverlayLoader';
import { useTasks } from '../hooks/useTasks';
import { formatDate } from '../../../utils/dateFormat';
import { usePermission } from '../../../context/PermissionProvider';

const statusFilters = ['All', 'Pending', 'In Progress', 'Completed'];
const statusMap: Record<string, string> = { Pending: '0', 'In Progress': '1', Completed: '2' };

const TaskListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { getOperationFlagsById } = usePermission();
  const viewFlags = getOperationFlagsById(10, 2);
  const createFlags = getOperationFlagsById(10, 1);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filters = activeFilter !== 'All' ? { status: statusMap[activeFilter] } : {};
  const { list, deleteMutation } = useTasks(filters);

  const filtered = useMemo(() => {
    if (!list.data) return [];
    if (!search.trim()) return list.data;
    const q = search.toLowerCase();
    return list.data.filter((t: any) =>
      [t.task_name, t.client_name, t.service_name, t.status_name]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(q)),
    );
  }, [list.data, search]);

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusKey = (status: number) => {
    if (status === 0) return 'pending';
    if (status === 1) return 'inprogress';
    return 'completed';
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(SCREEN.TASK_DETAIL, { task: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.taskName} numberOfLines={1}>{item.task_name}</Text>
        <StatusBadge status={getStatusKey(item.status)} />
      </View>

      {item.client_name && (
        <View style={styles.row}>
          <Icon name="domain" size={14} color={colors.textSecondary} />
          <Text style={styles.meta}>{item.client_name}</Text>
        </View>
      )}

      <View style={styles.row}>
        <Icon name="calendar-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.meta}>Due: {formatDate(item.due_date)}</Text>
      </View>

      {item.assignTo && item.assignTo.length > 0 && (
        <View style={styles.row}>
          <Icon name="account-group-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.meta} numberOfLines={1}>
            {item.assignTo.map((a: any) => a.emp_name).join(', ')}
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        {item.priority && (
          <StatusBadge status={item.priority.toLowerCase()} label={item.priority} />
        )}
        <View style={{ flex: 1 }} />
        {viewFlags.showDELETE && (
          <IconButton
            icon="delete-outline"
            iconColor={colors.error}
            size={18}
            onPress={() => setDeleteId(item.task_id)}
            style={{ margin: 0 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Tasks" />
      <OverlayLoader visible={deleteMutation.isPending} />

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search tasks..." />
      </View>

      {/* Status Filters */}
      <View style={styles.filters}>
        {statusFilters.map((f) => (
          <Chip
            key={f}
            selected={activeFilter === f}
            onPress={() => setActiveFilter(f)}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            textStyle={[styles.chipText, activeFilter === f && styles.chipTextActive]}
            showSelectedCheck={false}
          >
            {f}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.task_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={list.isRefetching}
        onRefresh={() => list.refetch()}
        ListEmptyComponent={
          list.isLoading ? null : <EmptyState icon="clipboard-off-outline" title="No tasks found" />
        }
      />

      {createFlags.showCREATE && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate(SCREEN.CREATE_TASK)}
          color="#FFF"
        />
      )}

      <ConfirmDialog
        visible={!!deleteId}
        message="Are you sure you want to delete this task?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  searchContainer: { padding: 16, paddingBottom: 0 },
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  listContent: { padding: 16, paddingTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskName: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { fontSize: 12, color: colors.textSecondary, marginLeft: 6, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.primary, borderRadius: 16 },
});

export default TaskListScreen;
