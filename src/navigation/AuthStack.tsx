import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREEN } from '../constants/routes';
import { colors } from '../theme';
import type { AuthStackParamList } from './types';

import LoginScreen from '../features/auth/screens/LoginScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name={SCREEN.LOGIN} component={LoginScreen} />
    {/* Future: ForgotPasswordScreen, VerifyOtpScreen */}
  </Stack.Navigator>
);

export default AuthStack;
