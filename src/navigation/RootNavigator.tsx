import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../features/auth/hooks/useAuth';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

import AuthStack from './AuthStack';
import AppNavigator from './AppNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const SplashLoading: React.FC = () => (
  <View style={styles.splash}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const RootNavigator: React.FC = () => {
  const { isLoggedIn, isLoading, restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return <SplashLoading />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
