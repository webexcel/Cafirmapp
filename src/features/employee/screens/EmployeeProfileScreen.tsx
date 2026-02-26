import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import { useEmployeeDetails } from '../hooks/useEmployees';

const Field: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.field}>
    <Icon name={icon} size={20} color={colors.accent} style={styles.fieldIcon} />
    <View style={styles.fieldContent}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const EmployeeProfileScreen: React.FC = () => {
  const route = useRoute<any>();
  const { id } = route.params;
  const { data, isLoading } = useEmployeeDetails(id);

  return (
    <View style={styles.flex}>
      <AppHeader title="Employee Profile" showBack showDrawer={false} />

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data ? (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Avatar Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {data.name?.charAt(0)?.toUpperCase() || 'E'}
              </Text>
            </View>
            <Text style={styles.profileName}>{data.name}</Text>
            <Text style={styles.profileRole}>{data.permission_name || 'Employee'}</Text>
          </View>

          {/* Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Field icon="badge-account-outline" label="Employee ID" value={String(data.employee_id)} />
            <Field icon="account-outline" label="Name" value={data.name} />
            <Field icon="email-outline" label="Email" value={data.email} />
            <Field icon="phone-outline" label="Phone" value={data.phone} />
            <Field icon="shield-account-outline" label="Role" value={data.permission_name || String(data.role)} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loader}>
          <Text style={{ color: colors.textSecondary }}>Employee not found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  profileName: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  profileRole: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldIcon: { marginRight: 14 },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textSecondary },
  fieldValue: { fontSize: 14, fontWeight: '500', color: colors.text, marginTop: 1 },
});

export default EmployeeProfileScreen;
