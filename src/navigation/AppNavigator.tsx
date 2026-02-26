import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../theme';
import { SCREEN } from '../constants/routes';

import BottomTabs from './BottomTabs';
import DrawerContent from './DrawerContent';

// Employee
import EmployeeListScreen from '../features/employee/screens/EmployeeListScreen';
import CreateEmployeeScreen from '../features/employee/screens/CreateEmployeeScreen';
import EmployeeProfileScreen from '../features/employee/screens/EmployeeProfileScreen';

// Client
import ClientListScreen from '../features/client/screens/ClientListScreen';
import CreateClientScreen from '../features/client/screens/CreateClientScreen';
import ClientProfileScreen from '../features/client/screens/ClientProfileScreen';

// Task
import CreateTaskScreen from '../features/task/screens/CreateTaskScreen';
import TaskDetailScreen from '../features/task/screens/TaskDetailScreen';

// Timesheet
import ViewTimesheetScreen from '../features/timesheet/screens/ViewTimesheetScreen';
import WeeklyTimesheetScreen from '../features/timesheet/screens/WeeklyTimesheetScreen';

// Attendance
import ViewAttendanceScreen from '../features/attendance/screens/ViewAttendanceScreen';

// Reports
import EmployeeReportScreen from '../features/reports/screens/EmployeeReportScreen';
import ClientReportScreen from '../features/reports/screens/ClientReportScreen';

// Master
import ServicesScreen from '../features/master/screens/ServicesScreen';
import ClientTypesScreen from '../features/master/screens/ClientTypesScreen';
import DocTypesScreen from '../features/master/screens/DocTypesScreen';
import FinYearScreen from '../features/master/screens/FinYearScreen';

// Config
import RolesScreen from '../features/config/screens/RolesScreen';
import MenuScreen from '../features/config/screens/MenuScreen';
import OperationsScreen from '../features/config/screens/OperationsScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={BottomTabs} />

    {/* Employee */}
    <Stack.Screen name={SCREEN.EMPLOYEE_LIST} component={EmployeeListScreen} />
    <Stack.Screen name={SCREEN.CREATE_EMPLOYEE} component={CreateEmployeeScreen} />
    <Stack.Screen name={SCREEN.EMPLOYEE_PROFILE} component={EmployeeProfileScreen} />

    {/* Client */}
    <Stack.Screen name={SCREEN.CLIENT_LIST} component={ClientListScreen} />
    <Stack.Screen name={SCREEN.CREATE_CLIENT} component={CreateClientScreen} />
    <Stack.Screen name={SCREEN.CLIENT_PROFILE} component={ClientProfileScreen} />

    {/* Task */}
    <Stack.Screen name={SCREEN.CREATE_TASK} component={CreateTaskScreen} />
    <Stack.Screen name={SCREEN.TASK_DETAIL} component={TaskDetailScreen} />

    {/* Timesheet */}
    <Stack.Screen name={SCREEN.VIEW_TIMESHEET} component={ViewTimesheetScreen} />
    <Stack.Screen name={SCREEN.WEEKLY_TIMESHEET} component={WeeklyTimesheetScreen} />

    {/* Attendance */}
    <Stack.Screen name={SCREEN.VIEW_ATTENDANCE} component={ViewAttendanceScreen} />

    {/* Reports */}
    <Stack.Screen name={SCREEN.EMPLOYEE_REPORT} component={EmployeeReportScreen} />
    <Stack.Screen name={SCREEN.CLIENT_REPORT} component={ClientReportScreen} />

    {/* Master */}
    <Stack.Screen name={SCREEN.SERVICES} component={ServicesScreen} />
    <Stack.Screen name={SCREEN.CLIENT_TYPES} component={ClientTypesScreen} />
    <Stack.Screen name={SCREEN.DOC_TYPES} component={DocTypesScreen} />
    <Stack.Screen name={SCREEN.FIN_YEAR} component={FinYearScreen} />

    {/* Config */}
    <Stack.Screen name={SCREEN.ROLES} component={RolesScreen} />
    <Stack.Screen name={SCREEN.MENU_CONFIG} component={MenuScreen} />
    <Stack.Screen name={SCREEN.OPERATIONS} component={OperationsScreen} />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        width: 280,
        backgroundColor: colors.surface,
      },
    }}
  >
    <Drawer.Screen name="App" component={MainStack} />
  </Drawer.Navigator>
);

export default AppNavigator;
