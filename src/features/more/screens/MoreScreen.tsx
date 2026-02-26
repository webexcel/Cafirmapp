import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import { SCREEN } from '../../../constants/routes';

interface MoreItem {
  label: string;
  icon: string;
  screen: string;
  color: string;
}

const sections: { title: string; items: MoreItem[] }[] = [
  {
    title: 'Management',
    items: [
      { label: 'Employees', icon: 'account-group-outline', screen: SCREEN.EMPLOYEE_LIST, color: colors.accent },
      { label: 'Clients', icon: 'domain', screen: SCREEN.CLIENT_LIST, color: '#1ABC9C' },
      { label: 'View Timesheet', icon: 'clock-check-outline', screen: SCREEN.VIEW_TIMESHEET, color: colors.primary },
      { label: 'Weekly Timesheet', icon: 'calendar-week', screen: SCREEN.WEEKLY_TIMESHEET, color: '#8E44AD' },
      { label: 'View Attendance', icon: 'calendar-account-outline', screen: SCREEN.VIEW_ATTENDANCE, color: colors.warning },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Employee Report', icon: 'chart-bar', screen: SCREEN.EMPLOYEE_REPORT, color: colors.accent },
      { label: 'Client Report', icon: 'chart-line', screen: SCREEN.CLIENT_REPORT, color: '#E91E63' },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { label: 'Services', icon: 'cog-outline', screen: SCREEN.SERVICES, color: colors.primary },
      { label: 'Client Types', icon: 'tag-outline', screen: SCREEN.CLIENT_TYPES, color: '#1ABC9C' },
      { label: 'Doc Types', icon: 'file-document-outline', screen: SCREEN.DOC_TYPES, color: colors.warning },
      { label: 'Fin Year', icon: 'calendar-text-outline', screen: SCREEN.FIN_YEAR, color: '#8E44AD' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Roles', icon: 'shield-account-outline', screen: SCREEN.ROLES, color: colors.accent },
      { label: 'Menus', icon: 'menu', screen: SCREEN.MENU_CONFIG, color: colors.primary },
      { label: 'Operations', icon: 'cog-transfer-outline', screen: SCREEN.OPERATIONS, color: '#E91E63' },
    ],
  },
];

const MoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.flex}>
      <AppHeader title="More" />
      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={styles.gridItem}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                    <Icon name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.gridLabel} numberOfLines={2}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12, paddingLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MoreScreen;
