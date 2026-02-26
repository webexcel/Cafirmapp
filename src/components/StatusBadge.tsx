import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme';

type Status = 'pending' | 'inprogress' | 'completed' | 'low' | 'medium' | 'critical';

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  pending: { bg: colors.warning + '20', text: colors.warning, label: 'Pending' },
  inprogress: { bg: colors.accent + '20', text: colors.accent, label: 'In Progress' },
  completed: { bg: colors.success + '20', text: colors.success, label: 'Completed' },
  low: { bg: colors.success + '20', text: colors.success, label: 'Low' },
  medium: { bg: colors.warning + '20', text: colors.warning, label: 'Medium' },
  critical: { bg: colors.error + '20', text: colors.error, label: 'Critical' },
};

interface StatusBadgeProps {
  status: Status | string;
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const key = String(status).toLowerCase() as Status;
  const config = statusConfig[key] || statusConfig.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label || config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default StatusBadge;
