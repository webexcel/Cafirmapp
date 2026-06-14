import React from 'react';
import MasterCrudScreen from '../../../components/MasterCrudScreen';
import { useFinYears } from '../hooks/useMaster';
import { usePermission } from '../../../context/PermissionProvider';

const FinYearScreen: React.FC = () => {
  const { list, addMutation, deleteMutation } = useFinYears();
  const { getOperationFlagsById } = usePermission();
  const flags = getOperationFlagsById(17, 1);

  return (
    <MasterCrudScreen
      showAdd={!!flags.showCREATE}
      showDelete={!!flags.showDELETE}
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
