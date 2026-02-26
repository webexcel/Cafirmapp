import React from 'react';
import MasterCrudScreen from '../../../components/MasterCrudScreen';
import { useServices } from '../hooks/useMaster';

const ServicesScreen: React.FC = () => {
  const { list, addMutation, deleteMutation } = useServices();

  return (
    <MasterCrudScreen
      title="Services"
      fieldLabel="Service Name"
      fieldKey="service_name"
      secondaryFieldLabel="Short Name"
      secondaryFieldKey="short_name"
      data={list.data || []}
      isLoading={list.isLoading}
      isRefetching={list.isRefetching}
      onRefresh={() => list.refetch()}
      onAdd={(values, cb) =>
        addMutation.mutate({ service_name: values.service_name, short_name: values.short_name }, { onSuccess: cb })
      }
      onDelete={(item) => deleteMutation.mutate({ id: item.service_id || item.id })}
      isAdding={addMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
};

export default ServicesScreen;
