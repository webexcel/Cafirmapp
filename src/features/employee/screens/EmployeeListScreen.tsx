import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import { SCREEN } from '../../../constants/routes';
import AppHeader from '../../../components/AppHeader';
import SearchBar from '../../../components/SearchBar';
import EmptyState from '../../../components/EmptyState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import OverlayLoader from '../../../components/OverlayLoader';
import { useEmployees } from '../hooks/useEmployees';
import { usePermission } from '../../../context/PermissionProvider';

const EmployeeListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { list, deleteMutation } = useEmployees();
  const { getOperationFlagsById } = usePermission();
  const viewFlags = getOperationFlagsById(3, 2);
  const createFlags = getOperationFlagsById(3, 1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!list.data) return [];
    if (!search.trim()) return list.data;
    const q = search.toLowerCase();
    return list.data.filter((e: any) =>
      [e.name, e.email, e.phone, e.permission_name]
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(SCREEN.EMPLOYEE_PROFILE, { id: item.employee_id })}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0)?.toUpperCase() || 'E'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.role} numberOfLines={1}>{item.permission_name || 'N/A'}</Text>
        <View style={styles.row}>
          <Icon name="email-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.detail} numberOfLines={1}>{item.email}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="phone-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.detail}>{item.phone}</Text>
        </View>
      </View>
      {viewFlags.showDELETE && (
        <IconButton
          icon="delete-outline"
          iconColor={colors.error}
          size={20}
          onPress={() => setDeleteId(item.employee_id)}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Employees" showBack />
      <OverlayLoader visible={deleteMutation.isPending} />

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search employees..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.employee_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={list.isRefetching}
        onRefresh={() => list.refetch()}
        ListEmptyComponent={
          list.isLoading ? null : <EmptyState icon="account-off-outline" title="No employees found" />
        }
      />

      {createFlags.showCREATE && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate(SCREEN.CREATE_EMPLOYEE)}
          color="#FFF"
        />
      )}

      <ConfirmDialog
        visible={!!deleteId}
        message="Are you sure you want to delete this employee?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  searchContainer: { padding: 16, paddingBottom: 0 },
  listContent: { padding: 16, paddingTop: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  role: { fontSize: 12, color: colors.accent, marginTop: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  detail: { fontSize: 12, color: colors.textSecondary, marginLeft: 4, flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
});

export default EmployeeListScreen;
