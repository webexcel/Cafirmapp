import React from 'react';
import MasterCrudScreen from '../../../components/MasterCrudScreen';
import { useClientTypes } from '../hooks/useMaster';

const ClientTypesScreen: React.FC = () => {
  const { list, addMutation, deleteMutation } = useClientTypes();

  return (
    <MasterCrudScreen
      title="Client Types"
      fieldLabel="Client Type"
      fieldKey="type_name"
      data={list.data || []}
      isLoading={list.isLoading}
      isRefetching={list.isRefetching}
      onRefresh={() => list.refetch()}
      onAdd={(values, cb) =>
        addMutation.mutate({ client_type_name: values.type_name }, { onSuccess: cb })
      }
      onDelete={(item) => deleteMutation.mutate({ id: item.id })}
      isAdding={addMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
};

export default ClientTypesScreen;
