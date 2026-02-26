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
import { useClients } from '../hooks/useClients';

const ClientListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { list, deleteMutation } = useClients();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!list.data) return [];
    if (!search.trim()) return list.data;
    const q = search.toLowerCase();
    return list.data.filter((c: any) =>
      [c.display_name, c.client_name, c.email, c.phone, c.contact_person, c.client_type]
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
      onPress={() => navigation.navigate(SCREEN.CLIENT_PROFILE, { id: item.client_id })}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Icon name="domain" size={22} color={colors.accent} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.display_name || item.client_name}</Text>
        <Text style={styles.type} numberOfLines={1}>{item.client_type || 'N/A'}</Text>
        <View style={styles.row}>
          <Icon name="account-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.detail} numberOfLines={1}>{item.contact_person}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="phone-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.detail}>{item.phone}</Text>
        </View>
      </View>
      <IconButton
        icon="delete-outline"
        iconColor={colors.error}
        size={20}
        onPress={() => setDeleteId(item.client_id)}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Clients" showBack />
      <OverlayLoader visible={deleteMutation.isPending} />

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search clients..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.client_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={list.isRefetching}
        onRefresh={() => list.refetch()}
        ListEmptyComponent={
          list.isLoading ? null : <EmptyState icon="domain" title="No clients found" />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate(SCREEN.CREATE_CLIENT)}
        color="#FFF"
      />

      <ConfirmDialog
        visible={!!deleteId}
        message="Are you sure you want to delete this client?"
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
    backgroundColor: colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  type: { fontSize: 12, color: colors.accent, marginTop: 1 },
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

export default ClientListScreen;
