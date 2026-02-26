import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '../../../api/permissions.api';
import Toast from 'react-native-toast-message';

export const useRoles = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await permissionsApi.getList();
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => permissionsApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      Toast.show({ type: 'success', text1: 'Role added' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Add failed' }),
  });

  return { list, addMutation };
};

export const useMenuConfig = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const res = await permissionsApi.getMenuList();
      return res.data.data;
    },
  });

  const parentMenus = useQuery({
    queryKey: ['parentMenus'],
    queryFn: async () => {
      const res = await permissionsApi.getParentMenuList();
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => permissionsApi.addMenu(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menus'] });
      Toast.show({ type: 'success', text1: 'Menu added' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Add failed' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (data: any) => permissionsApi.deleteMenu(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menus'] });
      Toast.show({ type: 'success', text1: 'Menu deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Delete failed' }),
  });

  return { list, parentMenus, addMutation, deleteMutation };
};

export const useOperations = () => {
  const qc = useQueryClient();

  const menuOps = useQuery({
    queryKey: ['menuOperations'],
    queryFn: async () => {
      const res = await permissionsApi.getMenuOperations();
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => permissionsApi.addMenuOperations(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menuOperations'] });
      Toast.show({ type: 'success', text1: 'Operations updated' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Update failed' }),
  });

  return { menuOps, addMutation };
};
