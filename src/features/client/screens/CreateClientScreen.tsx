import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import OverlayLoader from '../../../components/OverlayLoader';
import { useClients } from '../hooks/useClients';
import { formatDateToYYYYMMDD } from '../../../utils/dateFormat';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  displayname: yup.string().required('Display name is required'),
  clientType: yup.string().required('Client type is required'),
  contactPerson: yup.string().required('Contact person is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  address: yup.string().required('Address is required'),
  pincode: yup.string().required('Pincode is required'),
  gst_number: yup.string().notRequired(),
  pan_number: yup.string().notRequired(),
  tan_num: yup.string().notRequired(),
});

const CreateClientScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addMutation, clientTypes } = useClients();
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '', displayname: '', clientType: '', contactPerson: '', email: '',
      phone: '', address: '', pincode: '', gst_number: '', pan_number: '', tan_num: '',
    },
  });

  const selectedType = clientTypes.data?.find((t: any) => String(t.id) === watch('clientType'));
  const today = formatDateToYYYYMMDD(new Date());

  const onSubmit = (data: any) => {
    addMutation.mutate(
      {
        name: data.name, dis_name: data.displayname, type: data.clientType,
        cont_person: data.contactPerson, mail: data.email, phone: data.phone,
        address: data.address, pin: data.pincode, gst_num: data.gst_number,
        pan_num: data.pan_number, tan_num: data.tan_num,
        incop_date: today, fin_start: today, fin_end: today,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  const renderField = (name: string, label: string, opts: any = {}) => (
    <View key={name}>
      <Text style={styles.label}>{label}{opts.required !== false ? ' *' : ''}</Text>
      <Controller
        control={control}
        name={name as any}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            placeholder={`Enter ${label.toLowerCase()}`}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={opts.keyboardType || 'default'}
            autoCapitalize={opts.autoCapitalize || 'sentences'}
            maxLength={opts.maxLength}
            multiline={opts.multiline}
            numberOfLines={opts.multiline ? 3 : 1}
            outlineColor={(errors as any)[name] ? colors.error : colors.border}
            activeOutlineColor={colors.primary}
            style={[styles.input, opts.multiline && { height: 80 }]}
            outlineStyle={styles.outline}
          />
        )}
      />
      {(errors as any)[name] && <Text style={styles.error}>{(errors as any)[name]?.message}</Text>}
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Add Client" showBack showDrawer={false} />
      <OverlayLoader visible={addMutation.isPending} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {renderField('name', 'Name')}
        {renderField('displayname', 'Display Name')}

        <Text style={styles.label}>Client Type *</Text>
        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <View style={[styles.dropdownInput, errors.clientType && { borderColor: colors.error }]}>
              <Text
                style={[styles.dropdownText, !selectedType && { color: colors.disabled }]}
                onPress={() => setTypeMenuVisible(true)}
              >
                {selectedType?.type_name || 'Select client type'}
              </Text>
            </View>
          }
        >
          {(clientTypes.data || []).map((t: any) => (
            <Menu.Item
              key={t.id}
              title={t.type_name}
              onPress={() => {
                setValue('clientType', String(t.id), { shouldValidate: true });
                setTypeMenuVisible(false);
              }}
            />
          ))}
        </Menu>
        {errors.clientType && <Text style={styles.error}>{errors.clientType.message}</Text>}

        {renderField('contactPerson', 'Contact Person')}
        {renderField('email', 'Email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
        {renderField('phone', 'Phone', { keyboardType: 'phone-pad', maxLength: 10 })}
        {renderField('address', 'Address', { multiline: true })}
        {renderField('pincode', 'Pincode', { keyboardType: 'numeric' })}
        {renderField('gst_number', 'GSTIN', { required: false, maxLength: 15 })}
        {renderField('pan_number', 'PAN Number', { required: false, maxLength: 10 })}
        {renderField('tan_num', 'TAN Number', { required: false, maxLength: 10 })}

        <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.submitBtn}
          contentStyle={{ height: 48 }} labelStyle={{ fontWeight: '600' }}>
          Add Client
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  form: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.surface, fontSize: 14, height: 48 },
  outline: { borderRadius: 8 },
  error: { fontSize: 12, color: colors.error, marginTop: 4 },
  dropdownInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 14,
    minHeight: 48, justifyContent: 'center',
  },
  dropdownText: { fontSize: 14, color: colors.text },
  submitBtn: { marginTop: 24, borderRadius: 8, backgroundColor: colors.primary },
});

export default CreateClientScreen;
