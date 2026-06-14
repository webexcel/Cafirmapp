import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider, TouchableRipple, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { colors } from '../theme';
import { useAuth } from '../features/auth/hooks/useAuth';
import { SCREEN } from '../constants/routes';
import { usePermission } from '../context/PermissionProvider';

interface DrawerItem {
  label: string;
  icon: string;
  screen: string;
}

const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { menuItems: permissionMenuItems } = usePermission();

  // Flatten permission-based menu items into a flat list for the drawer
  const drawerItems: DrawerItem[] = React.useMemo(() => {
    const items: DrawerItem[] = [];
    permissionMenuItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          items.push({ label: child.title, icon: item.icon, screen: child.screen });
        });
      } else if (item.screen) {
        items.push({ label: item.title, icon: item.icon, screen: item.screen });
      }
    });
    return items;
  }, [permissionMenuItems]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleNavigate = (screen: string) => {
    navigation.closeDrawer();
    const tabScreens = [SCREEN.DASHBOARD, SCREEN.TASKS, SCREEN.TIMESHEET, SCREEN.ATTENDANCE, SCREEN.MORE];
    if (tabScreens.includes(screen)) {
      navigation.navigate('App', { screen: 'MainTabs', params: { screen } });
    } else {
      navigation.navigate('App', { screen });
    }
  };

  const handleLogout = async () => {
    navigation.closeDrawer();
    await logout();
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Text size={48} label={initials} style={styles.avatar} />
        <Text style={styles.name} numberOfLines={1}>{user?.name || 'User'}</Text>
        <Text style={styles.email} numberOfLines={1}>{user?.email || ''}</Text>
      </View>

      <Divider />

      {/* Menu Items */}
      <ScrollView style={styles.menuList}>
        {drawerItems.map((item) => (
          <TouchableRipple
            key={item.screen}
            onPress={() => handleNavigate(item.screen)}
            style={styles.menuItem}
          >
            <View style={styles.menuItemInner}>
              <Icon name={item.icon} size={22} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>

      <Divider />

      {/* Logout */}
      <TouchableRipple onPress={handleLogout} style={styles.menuItem}>
        <View style={styles.menuItemInner}>
          <Icon name="logout" size={22} color={colors.error} />
          <Text style={[styles.menuLabel, { color: colors.error }]}>Logout</Text>
        </View>
      </TouchableRipple>

      <View style={styles.footer}>
        <Text style={styles.version}>CAfirm v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: colors.primary,
  },
  avatar: {
    backgroundColor: colors.accent,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  menuList: {
    flex: 1,
    paddingTop: 4,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  version: {
    fontSize: 11,
    color: colors.disabled,
  },
});

export default DrawerContent;
