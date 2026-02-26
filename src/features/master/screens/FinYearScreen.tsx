import React from 'react';
import MasterCrudScreen from '../../../components/MasterCrudScreen';
import { useFinYears } from '../hooks/useMaster';

const FinYearScreen: React.FC = () => {
  const { list, addMutation, deleteMutation } = useFinYears();

  return (
    <MasterCrudScreen
      title="Financial Years"
      fieldLabel="Year"
      fieldKey="year"
      data={list.data || []}
      isLoading={list.isLoading}
      isRefetching={list.isRefetching}
      onRefresh={() => list.refetch()}
      onAdd={(values, cb) =>
        addMutation.mutate({ year: values.year }, { onSuccess: cb })
      }
      onDelete={(item) => deleteMutation.mutate({ id: item.id })}
      isAdding={addMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
};

export default FinYearScreen;
