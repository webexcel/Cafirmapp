import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { permissionsApi } from '../api/permissions.api';

interface Submenu {
  submenu: string;
  sequence_number: number;
  operations: { operation: string }[];
}

interface ParentMenu {
  parent_menu_id: number;
  parent_menu: string;
  submenus?: Submenu[];
}

interface OperationFlags {
  [key: string]: boolean;
}

interface MenuItem {
  title: string;
  icon: string;
  screen?: string;
  children?: { title: string; screen: string }[];
}

interface PermissionContextType {
  permissions: ParentMenu[];
  menuItems: MenuItem[];
  fetchPermissions: () => Promise<void>;
  getOperationFlagsById: (menuId: number, submenuSeq: number) => OperationFlags;
  hasScreenAccess: (screenName: string) => boolean;
  resetPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermission must be used within a PermissionProvider');
  return context;
};

// Map parent menu names (exactly as returned by the permissions API) to
// MaterialCommunityIcons.
const iconMap: Record<string, string> = {
  Dashboard: 'view-dashboard-outline',
  Calender: 'calendar-month-outline',
  'Employee Management': 'account-group-outline',
  'Client Management': 'domain',
  Task: 'clipboard-check-outline',
  TimeSheet: 'clock-outline',
  'Master Details': 'cog-outline',
  Reports: 'chart-bar',
  Configuration: 'shield-account-outline',
  'Attendance Management': 'calendar-check-outline',
  'Document Management': 'file-document-outline',
};

// Map parent/submenu names (exactly as returned by the permissions API) to
// registered navigation targets — either a bottom-tab name (Dashboard, Tasks,
// Timesheet, Attendance) or a stack screen name (see AppNavigator).
const screenMap: Record<string, string> = {
  // Top-level menus without submenus
  Dashboard: 'Dashboard',
  Calender: 'Dashboard', // no dedicated calendar screen on mobile
  'Document Management': 'Dashboard', // no dedicated document screen on mobile

  // Employee Management
  'Create Employee': 'CreateEmployee',
  'View / Edit Profile': 'EmployeeList',
  'Create  User Account': 'EmployeeList', // API sends two spaces; no dedicated screen

  // Client Management
  'Create Clients': 'CreateClient',
  'View / Edit Profiles': 'ClientList',

  // Task
  'Create Task': 'CreateTask',
  'View Task': 'Tasks',

  // TimeSheet
  'Add TimeSheet': 'Timesheet',
  'View TimeSheet': 'ViewTimesheet',
  'Weekly TimeSheet': 'WeeklyTimesheet',

  // Master Details
  'Create Service': 'Services',
  Roles: 'Roles',
  'Create Doc Type': 'DocTypes',
  'Create Fin Year': 'FinYear',
  'Create Client Type': 'ClientTypes',

  // Reports
  'Employee DateWise Report': 'EmployeeReport',
  'Client DateWise Report': 'ClientReport',

  // Configuration
  'Add Menu': 'MenuConfig',
  Operations: 'Operations',

  // Attendance Management
  'Add Attendance': 'Attendance',
  'View Attendance': 'ViewAttendance',
};

// Menu items intentionally hidden from the mobile app — these admin/setup
// features are handled on the web dashboard. Titles match the permissions API
// exactly (note the two spaces in "Create  User Account"). A parent section
// whose children are all hidden is dropped automatically.
const HIDDEN_MENU_TITLES = new Set([
  'Calender',
  'Create Employee',
  'View / Edit Profile',
  'Create  User Account',
  'Create Clients',
  'Create Service',
  'Roles',
  'Create Doc Type',
  'Create Fin Year',
  'Create Client Type',
  'Add Menu',
  'Operations',
  // Weekly Timesheet is merged into the "View TimeSheet" screen as a tab.
  'Weekly TimeSheet',
  // Add TimeSheet is reachable from the Timesheet tab, so hide it from the drawer.
  'Add TimeSheet',
  // Tasks are reachable from the bottom "Tasks" tab, so hide them from the drawer.
  'Create Task',
  'View Task',
]);

// Display-label overrides for specific menu items. Only the drawer label
// changes; screen mapping and permission checks still key off the original
// API title. The Clients list ("View / Edit Profiles") leads into Client 360;
// "View TimeSheet" now hosts both the list and weekly views, so it reads
// simply "Timesheet".
const MENU_TITLE_OVERRIDES: Record<string, string> = {
  'View / Edit Profiles': 'Client 360',
  'View TimeSheet': 'Timesheet',
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<ParentMenu[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchPermissions = useCallback(async () => {
    if (!user?.employee_id) return;
    try {
      const res = await permissionsApi.getUserPermissions(user.employee_id);
      setPermissions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  }, [user?.employee_id]);

  // Fetch permissions when user changes
  useEffect(() => {
    if (user?.employee_id) {
      fetchPermissions();
    }
  }, [user?.employee_id, fetchPermissions]);

  // Build menu items from permissions
  useEffect(() => {
    if (!permissions.length) return;

    const items: MenuItem[] = permissions
      .map((parent) => {
        const icon = iconMap[parent.parent_menu] || 'circle-outline';

        if (parent.submenus && parent.submenus.length > 0) {
          return {
            title: parent.parent_menu,
            icon,
            children: parent.submenus
              .filter((sub) => !HIDDEN_MENU_TITLES.has(sub.submenu))
              .map((sub) => ({
                title: MENU_TITLE_OVERRIDES[sub.submenu] || sub.submenu,
                screen: screenMap[sub.submenu] || 'Dashboard',
              })),
          };
        }

        return {
          title: parent.parent_menu,
          icon,
          screen: screenMap[parent.parent_menu] || 'Dashboard',
        };
      })
      // Drop hidden top-level items and parent sections whose children were all hidden
      .filter((item) => {
        if (HIDDEN_MENU_TITLES.has(item.title)) return false;
        if (item.children && item.children.length === 0) return false;
        return true;
      });

    setMenuItems(items);
  }, [permissions]);

  const getOperationFlagsById = useCallback(
    (menuId: number, submenuSeq: number): OperationFlags => {
      const menu = permissions.find((m) => m.parent_menu_id === menuId);
      const submenu = menu?.submenus?.find((s) => s.sequence_number === submenuSeq);
      if (!submenu) return {};
      return submenu.operations.reduce<OperationFlags>((acc, { operation }) => {
        acc[`show${operation}`] = true;
        return acc;
      }, {});
    },
    [permissions],
  );

  const hasScreenAccess = useCallback(
    (screenName: string): boolean => {
      return menuItems.some(
        (item) =>
          item.screen === screenName ||
          item.children?.some((child) => child.screen === screenName),
      );
    },
    [menuItems],
  );

  const resetPermissions = useCallback(() => {
    setPermissions([]);
    setMenuItems([]);
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        menuItems,
        fetchPermissions,
        getOperationFlagsById,
        hasScreenAccess,
        resetPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
