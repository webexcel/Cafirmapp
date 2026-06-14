import React from 'react';
import MasterCrudScreen from '../../../components/MasterCrudScreen';
import { useDocTypes } from '../hooks/useMaster';
import { usePermission } from '../../../context/PermissionProvider';

const DocTypesScreen: React.FC = () => {
  const { list, addMutation, deleteMutation } = useDocTypes();
  const { getOperationFlagsById } = usePermission();
  const flags = getOperationFlagsById(17, 1);

  return (
    <MasterCrudScreen
      showAdd={!!flags.showCREATE}
      showDelete={!!flags.showDELETE}
      title="Document Types"
      fieldLabel="Document Type"
      fieldKey="type_name"
      data={list.data || []}
      isLoading={list.isLoading}
      isRefetching={list.isRefetching}
      onRefresh={() => list.refetch()}
      onAdd={(values, cb) =>
        addMutation.mutate({ document_type: values.type_name }, { onSuccess: cb })
      }
      onDelete={(item) => deleteMutation.mutate({ id: item.id })}
      isAdding={addMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
};

export default DocTypesScreen;
