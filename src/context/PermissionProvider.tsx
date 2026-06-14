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

// Map parent menu names to MaterialCommunityIcons
const iconMap: Record<string, string> = {
  Dashboard: 'view-dashboard-outline',
  'Employee Management': 'account-group-outline',
  'Client Management': 'domain',
  'Task Management': 'clipboard-check-outline',
  'Timesheet Management': 'clock-outline',
  Attendance: 'calendar-check-outline',
  Reports: 'chart-bar',
  'Master Class': 'cog-outline',
  Configuration: 'shield-account-outline',
  'Document Management': 'file-document-outline',
  Calendar: 'calendar-month-outline',
};

// Map submenu names to navigation screens
const screenMap: Record<string, string> = {
  Dashboard: 'Dashboard',
  'Add Employee': 'CreateEmployee',
  'View Employee': 'EmployeeList',
  'Add Client': 'CreateClient',
  'View Client': 'ClientList',
  'Add Task': 'CreateTask',
  'View Task': 'TaskList',
  'Add Timesheet': 'AddTimesheet',
  'View Timesheet': 'ViewTimesheet',
  'Weekly Timesheet': 'WeeklyTimesheet',
  'Activity Tracker': 'ActivityTracker',
  'View Attendance': 'ViewAttendance',
  'Employee Report': 'EmployeeReport',
  'Client Report': 'ClientReport',
  Services: 'Services',
  'Client Type': 'ClientTypes',
  'Document Type': 'DocTypes',
  'Financial Year': 'FinYear',
  Roles: 'Roles',
  Menu: 'MenuConfig',
  Operations: 'Operations',
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

    const items: MenuItem[] = permissions.map((parent) => {
      const icon = iconMap[parent.parent_menu] || 'circle-outline';

      if (parent.submenus && parent.submenus.length > 0) {
        return {
          title: parent.parent_menu,
          icon,
          children: parent.submenus.map((sub) => ({
            title: sub.submenu,
            screen: screenMap[sub.submenu] || 'More',
          })),
        };
      }

      return {
        title: parent.parent_menu,
        icon,
        screen: screenMap[parent.parent_menu] || 'Dashboard',
      };
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
