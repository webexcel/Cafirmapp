import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as StoreProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { store } from './src/app/store';
import { queryClient } from './src/app/queryClient';
import { paperTheme, navigationTheme, colors } from './src/theme';
import { PermissionProvider } from './src/context/PermissionProvider';
import RootNavigator from './src/navigation/RootNavigator';

const App: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <StoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={colors.primary}
              />
              <PermissionProvider>
                <RootNavigator />
              </PermissionProvider>
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </StoreProvider>
    <Toast />
  </GestureHandlerRootView>
);

export default App;
