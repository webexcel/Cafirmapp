import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import SearchBar from '../../../components/SearchBar';
import EmptyState from '../../../components/EmptyState';
import OverlayLoader from '../../../components/OverlayLoader';
import { useRoles } from '../hooks/useConfig';

const RolesScreen: React.FC = () => {
  const { list, addMutation } = useRoles();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');

  const filtered = (list.data || []).filter((r: any) => {
    if (!search.trim()) return true;
    return String(r.permission_name).toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = () => {
    if (!name.trim() || !description.trim()) return;
    addMutation.mutate(
      { permission_name: name.trim(), description: description.trim(), operations: [] },
      { onSuccess: () => { setName(''); setDescription(''); } },
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={styles.sno}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.roleName}>{item.permission_name}</Text>
        <Text style={styles.roleDesc}>{item.description || ''}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Roles" showBack />
      <OverlayLoader visible={addMutation.isPending} />

      <View style={styles.addSection}>
        <TextInput mode="outlined" placeholder="Role name" value={name} onChangeText={setName}
          style={styles.addInput} outlineStyle={styles.outline} outlineColor={colors.border}
          activeOutlineColor={colors.primary} />
        <TextInput mode="outlined" placeholder="Description" value={description} onChangeText={setDescription}
          style={[styles.addInput, { marginTop: 8 }]} outlineStyle={styles.outline}
          outlineColor={colors.border} activeOutlineColor={colors.primary} />
        <Button mode="contained" onPress={handleAdd} style={styles.addBtn}
          contentStyle={{ height: 42 }} icon="plus">
          Add Role
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search roles..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.permission_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={list.isRefetching}
        onRefresh={() => list.refetch()}
        ListEmptyComponent={list.isLoading ? null : <EmptyState icon="shield-off-outline" title="No roles" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  addSection: { backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  addInput: { backgroundColor: colors.surface, fontSize: 14, height: 44 },
  outline: { borderRadius: 8 },
  addBtn: { marginTop: 10, borderRadius: 8, backgroundColor: colors.primary },
  searchContainer: { padding: 16, paddingBottom: 0 },
  listContent: { padding: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowEven: { backgroundColor: colors.surface, borderRadius: 8 },
  sno: { width: 32, fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  roleName: { fontSize: 14, fontWeight: '600', color: colors.text },
  roleDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default RolesScreen;
