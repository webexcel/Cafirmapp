import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterApi } from '../../../api/master.api';
import Toast from 'react-native-toast-message';

const useMasterCrud = (key: string, getFn: () => Promise<any>, addFn: (d: any) => Promise<any>, deleteFn: (d: any) => Promise<any>) => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const res = await getFn();
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: addFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      Toast.show({ type: 'success', text1: 'Added successfully' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Add failed' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      Toast.show({ type: 'success', text1: 'Deleted successfully' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Delete failed' }),
  });

  return { list, addMutation, deleteMutation };
};

export const useServices = () =>
  useMasterCrud('services', masterApi.getServices, masterApi.addService, masterApi.deleteService);

export const useClientTypes = () =>
  useMasterCrud('clientTypes', masterApi.getClientTypes, masterApi.addClientType, masterApi.deleteClientType);

export const useDocTypes = () =>
  useMasterCrud('docTypes', masterApi.getDocTypes, masterApi.addDocType, masterApi.deleteDocType);

export const useFinYears = () =>
  useMasterCrud('finYears', masterApi.getYears, masterApi.addYear, masterApi.deleteYear);
