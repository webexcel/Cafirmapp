import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../../../api/clientMgmt.api';
import { masterApi } from '../../../api/master.api';
import Toast from 'react-native-toast-message';

export const useClients = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await clientApi.getAll();
      return res.data.data;
    },
  });

  const clientTypes = useQuery({
    queryKey: ['clientTypes'],
    queryFn: async () => {
      const res = await masterApi.getClientTypes();
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientApi.delete({ client_id: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      Toast.show({ type: 'success', text1: 'Client deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Delete failed' }),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => clientApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      Toast.show({ type: 'success', text1: 'Client added' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Add failed' }),
  });

  const editMutation = useMutation({
    mutationFn: (data: any) => clientApi.edit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      Toast.show({ type: 'success', text1: 'Client updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Update failed' }),
  });

  return { list, clientTypes, deleteMutation, addMutation, editMutation };
};

export const useClientDetails = (id: number) =>
  useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const res = await clientApi.getDetails({ id });
      return res.data.data?.[0] || null;
    },
    enabled: !!id,
  });
