import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SCREEN } from '../constants/routes';
import { colors } from '../theme';
import type { BottomTabParamList } from './types';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import TaskListScreen from '../features/task/screens/TaskListScreen';
import AddTimesheetScreen from '../features/timesheet/screens/AddTimesheetScreen';
import ActivityTrackerScreen from '../features/attendance/screens/ActivityTrackerScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const tabIcons: Record<string, string> = {
  [SCREEN.DASHBOARD]: 'view-dashboard-outline',
  [SCREEN.TASKS]: 'clipboard-check-outline',
  [SCREEN.TIMESHEET]: 'clock-outline',
  [SCREEN.ATTENDANCE]: 'calendar-check-outline',
};

const BottomTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => (
        <Icon name={tabIcons[route.name] || 'circle'} size={size} color={color} />
      ),
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.disabled,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 4,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name={SCREEN.DASHBOARD} component={DashboardScreen} />
    <Tab.Screen name={SCREEN.TASKS} component={TaskListScreen} options={{ tabBarLabel: 'Tasks' }} />
    <Tab.Screen name={SCREEN.TIMESHEET} component={AddTimesheetScreen} options={{ tabBarLabel: 'Timesheet' }} />
    <Tab.Screen name={SCREEN.ATTENDANCE} component={ActivityTrackerScreen} options={{ tabBarLabel: 'Attendance' }} />
  </Tab.Navigator>
);

export default BottomTabs;
