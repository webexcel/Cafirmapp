import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Toast from 'react-native-toast-message';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import OverlayLoader from '../../../components/OverlayLoader';
import { useEmployees } from '../hooks/useEmployees';
import { permissionsApi } from '../../../api/permissions.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  role: yup.string().required('Role is required'),
});

const CreateEmployeeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addMutation } = useEmployees();
  const user = useSelector((s: RootState) => s.auth.user);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', email: '', phone: '', role: '' },
  });

  useEffect(() => {
    permissionsApi.getList().then((res) => setRoles(res.data.data || [])).catch(() => {});
  }, []);

  const selectedRole = roles.find((r) => String(r.permission_id) === watch('role'));

  const onSubmit = (data: any) => {
    addMutation.mutate(
      { name: data.name, email: data.email, phone: data.phone, role: data.role, user_id: user?.employee_id },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Add Employee" showBack showDrawer={false} />
      <OverlayLoader visible={addMutation.isPending} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <Text style={styles.label}>Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput mode="outlined" placeholder="Enter name" value={value} onChangeText={onChange}
              onBlur={onBlur} outlineColor={errors.name ? colors.error : colors.border}
              activeOutlineColor={colors.primary} style={styles.input} outlineStyle={styles.outline} />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        {/* Email */}
        <Text style={styles.label}>Email *</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput mode="outlined" placeholder="Enter email" value={value} onChangeText={onChange}
              onBlur={onBlur} keyboardType="email-address" autoCapitalize="none"
              outlineColor={errors.email ? colors.error : colors.border}
              activeOutlineColor={colors.primary} style={styles.input} outlineStyle={styles.outline} />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        {/* Phone */}
        <Text style={styles.label}>Phone *</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput mode="outlined" placeholder="Enter phone" value={value} onChangeText={onChange}
              onBlur={onBlur} keyboardType="phone-pad" maxLength={10}
              outlineColor={errors.phone ? colors.error : colors.border}
              activeOutlineColor={colors.primary} style={styles.input} outlineStyle={styles.outline} />
          )}
        />
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

        {/* Role Dropdown */}
        <Text style={styles.label}>Role *</Text>
        <Menu
          visible={roleMenuVisible}
          onDismiss={() => setRoleMenuVisible(false)}
          anchor={
            <TouchableInput
              value={selectedRole?.permission_name || ''}
              placeholder="Select role"
              onPress={() => setRoleMenuVisible(true)}
              error={!!errors.role}
            />
          }
        >
          {roles.map((r: any) => (
            <Menu.Item
              key={r.permission_id}
              title={r.permission_name}
              onPress={() => {
                setValue('role', String(r.permission_id), { shouldValidate: true });
                setRoleMenuVisible(false);
              }}
            />
          ))}
        </Menu>
        {errors.role && <Text style={styles.error}>{errors.role.message}</Text>}

        <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.submitBtn}
          contentStyle={{ height: 48 }} labelStyle={{ fontWeight: '600' }}>
          Add Employee
        </Button>
      </ScrollView>
    </View>
  );
};

const TouchableInput: React.FC<{ value: string; placeholder: string; onPress: () => void; error?: boolean }> = ({
  value, placeholder, onPress, error,
}) => (
  <View style={[styles.dropdownInput, error && { borderColor: colors.error }]}>
    <Text style={[styles.dropdownText, !value && { color: colors.disabled }]} onPress={onPress}>
      {value || placeholder}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.surface, fontSize: 14, height: 48 },
  outline: { borderRadius: 8 },
  error: { fontSize: 12, color: colors.error, marginTop: 4 },
  dropdownInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  dropdownText: { fontSize: 14, color: colors.text },
  submitBtn: { marginTop: 24, borderRadius: 8, backgroundColor: colors.primary },
});

export default CreateEmployeeScreen;
