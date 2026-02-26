import { SCREEN } from '../constants/routes';

// Auth Stack
export type AuthStackParamList = {
  [SCREEN.LOGIN]: undefined;
  [SCREEN.FORGOT_PASSWORD]: undefined;
  [SCREEN.VERIFY_OTP]: { email: string };
};

// Bottom Tabs
export type BottomTabParamList = {
  [SCREEN.DASHBOARD]: undefined;
  [SCREEN.TASKS]: undefined;
  [SCREEN.TIMESHEET]: undefined;
  [SCREEN.ATTENDANCE]: undefined;
  [SCREEN.MORE]: undefined;
};

// Drawer
export type DrawerParamList = {
  MainTabs: undefined;
  [SCREEN.EMPLOYEE_LIST]: undefined;
  [SCREEN.CLIENT_LIST]: undefined;
  [SCREEN.EMPLOYEE_REPORT]: undefined;
  [SCREEN.CLIENT_REPORT]: undefined;
  [SCREEN.SERVICES]: undefined;
  [SCREEN.CLIENT_TYPES]: undefined;
  [SCREEN.DOC_TYPES]: undefined;
  [SCREEN.FIN_YEAR]: undefined;
  [SCREEN.ROLES]: undefined;
  [SCREEN.MENU_CONFIG]: undefined;
  [SCREEN.OPERATIONS]: undefined;
};

// Root
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
