import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { colors } from '../theme';
import AppHeader from './AppHeader';
import SearchBar from './SearchBar';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';
import OverlayLoader from './OverlayLoader';

interface MasterCrudScreenProps {
  title: string;
  fieldLabel: string;
  fieldKey: string;
  secondaryFieldLabel?: string;
  secondaryFieldKey?: string;
  data: any[];
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onAdd: (values: Record<string, string>, cb: () => void) => void;
  onDelete: (item: any) => void;
  isAdding: boolean;
  isDeleting: boolean;
  showAdd?: boolean;
  showDelete?: boolean;
}

const MasterCrudScreen: React.FC<MasterCrudScreenProps> = ({
  title, fieldLabel, fieldKey, secondaryFieldLabel, secondaryFieldKey,
  data, isLoading, isRefetching, onRefresh, onAdd, onDelete, isAdding, isDeleting,
  showAdd = true, showDelete = true,
}) => {
  const [newValue, setNewValue] = useState('');
  const [newSecondary, setNewSecondary] = useState('');
  const [search, setSearch] = useState('');
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, search]);

  const handleAdd = () => {
    if (!newValue.trim()) return;
    const values: Record<string, string> = { [fieldKey]: newValue.trim() };
    if (secondaryFieldKey && newSecondary.trim()) {
      values[secondaryFieldKey] = newSecondary.trim();
    }
    onAdd(values, () => {
      setNewValue('');
      setNewSecondary('');
    });
  };

  const handleDelete = () => {
    if (deleteItem) {
      onDelete(deleteItem);
      setDeleteItem(null);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={styles.sno}>{index + 1}</Text>
      <Text style={styles.itemText} numberOfLines={1}>{item[fieldKey]}</Text>
      {secondaryFieldKey && (
        <Text style={styles.itemSecondary} numberOfLines={1}>{item[secondaryFieldKey]}</Text>
      )}
      {showDelete && (
        <IconButton
          icon="delete-outline"
          iconColor={colors.error}
          size={18}
          onPress={() => setDeleteItem(item)}
          style={{ margin: 0 }}
        />
      )}
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title={title} showBack />
      <OverlayLoader visible={isAdding || isDeleting} />

      {/* Add Section */}
      {showAdd && (
        <View style={styles.addSection}>
          <TextInput
            mode="outlined"
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            value={newValue}
            onChangeText={setNewValue}
            style={styles.addInput}
            outlineStyle={styles.outline}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
          {secondaryFieldLabel && (
            <TextInput
              mode="outlined"
              placeholder={`Enter ${secondaryFieldLabel.toLowerCase()}`}
              value={newSecondary}
              onChangeText={setNewSecondary}
              style={[styles.addInput, { marginTop: 8 }]}
              outlineStyle={styles.outline}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          )}
          <Button mode="contained" onPress={handleAdd} style={styles.addBtn}
            contentStyle={{ height: 42 }} icon="plus">
            Add
          </Button>
        </View>
      )}

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item.id || item.service_id || i)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={isRefetching}
        onRefresh={onRefresh}
        ListEmptyComponent={
          isLoading ? null : <EmptyState icon="database-off-outline" title="No records" />
        }
      />

      <ConfirmDialog
        visible={!!deleteItem}
        message="Are you sure you want to delete this record?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
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
  itemText: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
  itemSecondary: { width: 80, fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});

export default MasterCrudScreen;
