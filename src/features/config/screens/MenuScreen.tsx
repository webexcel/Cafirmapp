import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, Button, IconButton, Menu } from 'react-native-paper';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import EmptyState from '../../../components/EmptyState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import OverlayLoader from '../../../components/OverlayLoader';
import { useMenuConfig } from '../hooks/useConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

const MenuScreen: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const { list, parentMenus, addMutation, deleteMutation } = useMenuConfig();

  const [menuType, setMenuType] = useState<'0' | '1'>('0'); // 0=parent, 1=child
  const [menuName, setMenuName] = useState('');
  const [parentId, setParentId] = useState('');
  const [subMenuName, setSubMenuName] = useState('');
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [parentMenuVisible, setParentMenuVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const selectedParent = (parentMenus.data || []).find((p: any) => String(p.menu_id) === parentId);

  const handleAdd = () => {
    if (menuType === '0' && !menuName.trim()) return;
    if (menuType === '1' && (!parentId || !subMenuName.trim())) return;

    addMutation.mutate(
      {
        type: menuType,
        parent_id: menuType === '1' ? parentId : null,
        menu_name: menuType === '0' ? menuName.trim() : subMenuName.trim(),
        user_id: user?.employee_id,
      },
      { onSuccess: () => { setMenuName(''); setSubMenuName(''); setParentId(''); } },
    );
  };

  const handleDelete = () => {
    if (deleteItem) {
      deleteMutation.mutate({ menu_id: deleteItem.menu_id });
      setDeleteItem(null);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={styles.sno}>{index + 1}</Text>
      <Text style={styles.itemText} numberOfLines={1}>{item.menu_name}</Text>
      <IconButton icon="delete-outline" iconColor={colors.error} size={18}
        onPress={() => setDeleteItem(item)} style={{ margin: 0 }} />
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Menu Config" showBack />
      <OverlayLoader visible={addMutation.isPending || deleteMutation.isPending} />

      <View style={styles.addSection}>
        {/* Menu Type */}
        <Text style={styles.label}>Type</Text>
        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <View style={styles.dropdownInput}>
              <Text style={styles.dropdownText} onPress={() => setTypeMenuVisible(true)}>
                {menuType === '0' ? 'Parent Menu' : 'Sub Menu'}
              </Text>
            </View>
          }
        >
          <Menu.Item title="Parent Menu" onPress={() => { setMenuType('0'); setTypeMenuVisible(false); }} />
          <Menu.Item title="Sub Menu" onPress={() => { setMenuType('1'); setTypeMenuVisible(false); }} />
        </Menu>

        {menuType === '0' ? (
          <>
            <Text style={styles.label}>Menu Name</Text>
            <TextInput mode="outlined" placeholder="Enter menu name" value={menuName} onChangeText={setMenuName}
              style={styles.addInput} outlineStyle={styles.outline} outlineColor={colors.border}
              activeOutlineColor={colors.primary} />
          </>
        ) : (
          <>
            <Text style={styles.label}>Parent Menu</Text>
            <Menu
              visible={parentMenuVisible}
              onDismiss={() => setParentMenuVisible(false)}
              anchor={
                <View style={styles.dropdownInput}>
                  <Text style={[styles.dropdownText, !selectedParent && { color: colors.disabled }]}
                    onPress={() => setParentMenuVisible(true)}>
                    {selectedParent?.menu_name || 'Select parent menu'}
                  </Text>
                </View>
              }
            >
              {(parentMenus.data || []).map((p: any) => (
                <Menu.Item key={p.menu_id} title={p.menu_name}
                  onPress={() => { setParentId(String(p.menu_id)); setParentMenuVisible(false); }} />
              ))}
            </Menu>

            <Text style={styles.label}>Sub Menu Name</Text>
            <TextInput mode="outlined" placeholder="Enter sub menu name" value={subMenuName}
              onChangeText={setSubMenuName} style={styles.addInput} outlineStyle={styles.outline}
              outlineColor={colors.border} activeOutlineColor={colors.primary} />
          </>
        )}

        <Button mode="contained" onPress={handleAdd} style={styles.addBtn}
          contentStyle={{ height: 42 }} icon="plus">
          Add Menu
        </Button>
      </View>

      <FlatList
        data={list.data || []}
        keyExtractor={(item) => String(item.menu_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={list.isRefetching}
        onRefresh={() => list.refetch()}
        ListEmptyComponent={list.isLoading ? null : <EmptyState icon="menu" title="No menus" />}
      />

      <ConfirmDialog visible={!!deleteItem} message="Delete this menu?" onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  addSection: { backgroundColor: colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4, marginTop: 10 },
  addInput: { backgroundColor: colors.surface, fontSize: 14, height: 44 },
  outline: { borderRadius: 8 },
  dropdownInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  dropdownText: { fontSize: 14, color: colors.text },
  addBtn: { marginTop: 12, borderRadius: 8, backgroundColor: colors.primary },
  listContent: { padding: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowEven: { backgroundColor: colors.surface, borderRadius: 8 },
  sno: { width: 32, fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  itemText: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
});

export default MenuScreen;
