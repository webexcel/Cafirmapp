import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title = 'Confirm',
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onCancel} style={{ borderRadius: 12 }}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium">{message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onCancel}>{cancelLabel}</Button>
        <Button mode="contained" onPress={onConfirm}>{confirmLabel}</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);

export default ConfirmDialog;
