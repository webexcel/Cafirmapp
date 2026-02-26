import React from 'react';
import { Appbar } from 'react-native-paper';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { colors } from '../theme';

interface AppHeaderProps {
  title: string;
  showDrawer?: boolean;
  showBack?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showDrawer = true, showBack = false }) => {
  const navigation = useNavigation();

  return (
    <Appbar.Header
      style={{ backgroundColor: colors.primary, elevation: 2 }}
      statusBarHeight={0}
    >
      {showBack && <Appbar.BackAction onPress={() => navigation.goBack()} iconColor="#FFF" />}
      {showDrawer && !showBack && (
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          iconColor="#FFF"
        />
      )}
      <Appbar.Content title={title} titleStyle={{ color: '#FFF', fontSize: 17, fontWeight: '600' }} />
    </Appbar.Header>
  );
};

export default AppHeader;
