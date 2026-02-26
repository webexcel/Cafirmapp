import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Menu } from 'react-native-paper';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import EmptyState from '../../../components/EmptyState';
import OverlayLoader from '../../../components/OverlayLoader';
import { useOperations, useMenuConfig } from '../hooks/useConfig';

const OperationsScreen: React.FC = () => {
  const { list: menuList } = useMenuConfig();
  const { menuOps, addMutation } = useOperations();

  const [selectedMenu, setSelectedMenu] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const selectedMenuName = (menuList.data || []).find((m: any) => String(m.menu_id) === selectedMenu)?.menu_name || '';

  const handleAssign = () => {
    if (!selectedMenu) return;
    addMutation.mutate({ menu_id: selectedMenu, operation_ids: [] });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={styles.sno}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuName}>{item.menu_name}</Text>
        <Text style={styles.opsText} numberOfLines={2}>
          {item.operations?.map((o: any) => o.label || o.operation_name).join(', ') || 'No operations'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Operations" showBack />
      <OverlayLoader visible={addMutation.isPending} />

      <View style={styles.filterSection}>
        <Text style={styles.label}>Menu</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <View style={styles.dropdownInput}>
              <Text style={[styles.dropdownText, !selectedMenuName && { color: colors.disabled }]}
                onPress={() => setMenuVisible(true)}>
                {selectedMenuName || 'Select menu'}
              </Text>
            </View>
          }
        >
          {(menuList.data || []).map((m: any) => (
            <Menu.Item key={m.menu_id} title={m.menu_name}
              onPress={() => { setSelectedMenu(String(m.menu_id)); setMenuVisible(false); }} />
          ))}
        </Menu>
        <Button mode="contained" onPress={handleAssign} style={styles.assignBtn}
          contentStyle={{ height: 42 }} icon="cog-outline">
          Assign Operations
        </Button>
      </View>

      <FlatList
        data={menuOps.data || []}
        keyExtractor={(item, i) => String(item.menu_id || i)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={menuOps.isRefetching}
        onRefresh={() => menuOps.refetch()}
        ListEmptyComponent={menuOps.isLoading ? null : <EmptyState icon="cog-off-outline" title="No operations" />}
      />
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
  assignBtn: { marginTop: 12, borderRadius: 8, backgroundColor: colors.primary },
  listContent: { padding: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowEven: { backgroundColor: colors.surface, borderRadius: 8 },
  sno: { width: 32, fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  menuName: { fontSize: 14, fontWeight: '600', color: colors.text },
  opsText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default OperationsScreen;
