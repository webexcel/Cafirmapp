import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../../utils/validation';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../../../theme';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res?.status) {
        Toast.show({ type: 'success', text1: 'Welcome back!', text2: res.message || '' });
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Connection Error! Please try again.';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo / Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <Icon name="briefcase-outline" size={36} color={colors.surface} />
            </View>
            <Text style={styles.brandTitle}>CAfirm</Text>
            <Text style={styles.brandSubtitle}>Sign in to your account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    placeholder="Enter Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    left={<TextInput.Icon icon="email-outline" />}
                    outlineColor={errors.email ? colors.error : colors.border}
                    activeOutlineColor={errors.email ? colors.error : colors.primary}
                    outlineStyle={styles.inputOutline}
                    style={styles.input}
                    error={!!errors.email}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={secureText}
                    left={<TextInput.Icon icon="lock-outline" />}
                    right={
                      <TextInput.Icon
                        icon={secureText ? 'eye-off-outline' : 'eye-outline'}
                        onPress={() => setSecureText(!secureText)}
                      />
                    }
                    outlineColor={errors.password ? colors.error : colors.border}
                    activeOutlineColor={errors.password ? colors.error : colors.primary}
                    outlineStyle={styles.inputOutline}
                    style={styles.input}
                    error={!!errors.password}
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Sign In Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading}
              style={styles.signInBtn}
              contentStyle={styles.signInBtnContent}
              labelStyle={styles.signInBtnLabel}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  container: {
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    fontSize: 14,
    height: 48,
  },
  inputOutline: {
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  signInBtn: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  signInBtnContent: {
    height: 48,
  },
  signInBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginScreen;
