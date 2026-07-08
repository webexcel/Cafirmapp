import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../../../theme';
import { SCREEN } from '../../../constants/routes';
import { RootState } from '../../../app/store';
import AppHeader from '../../../components/AppHeader';
import SearchBar from '../../../components/SearchBar';
import EmptyState from '../../../components/EmptyState';
import { employeeApi } from '../../../api/employee.api';

const Employee360ListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // getByPermission returns every employee for admins/superadmins and a
    // scoped list for everyone else — matching the View Attendance behaviour.
    employeeApi
      .getByPermission({ emp_id: user?.employee_id ?? 0 })
      .then((r) => setEmployees(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.employee_id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter((e) =>
      [e.name, e.email, e.permission_name]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(q)),
    );
  }, [employees, search]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate(SCREEN.EMPLOYEE_360, { id: item.employee_id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'E'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.role} numberOfLines={1}>{item.permission_name || 'Employee'}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={colors.disabled} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Employee 360" showBack showDrawer={false} />
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search employees..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.employee_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? null : <EmptyState icon="account-off-outline" title="No employees found" />
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  role: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default Employee360ListScreen;
