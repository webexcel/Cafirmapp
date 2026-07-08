import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateFormat';

// Map a task status (the API returns it as a string "0"/"1"/"2") to the
// StatusBadge key. Coerce to Number so both string and numeric forms work.
export const taskStatusKey = (status: number | string): string => {
  const s = Number(status);
  return s === 0 ? 'pending' : s === 1 ? 'inprogress' : 'completed';
};

export interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

// A responsive row of stat tiles that wraps (2+ per row) for the 360 summary.
export const StatRow: React.FC<{ items: StatItem[] }> = ({ items }) => (
  <View style={styles.statRow}>
    {items.map((it, i) => (
      <View key={i} style={styles.statTile}>
        <Text style={[styles.statValue, it.color ? { color: it.color } : null]}>{it.value}</Text>
        <Text style={styles.statLabel}>{it.label}</Text>
      </View>
    ))}
  </View>
);

// A titled card that wraps a section's rows, with a count chip and empty text.
export const SectionCard: React.FC<{
  title: string;
  icon: string;
  count?: number;
  empty?: boolean;
  emptyText?: string;
  children?: React.ReactNode;
}> = ({ title, icon, count, empty, emptyText = 'Nothing to show', children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={styles.cardTitle}>{title}</Text>
      {count != null && (
        <View style={styles.countChip}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </View>
    {empty ? <Text style={styles.emptyText}>{emptyText}</Text> : children}
  </View>
);

export const TaskRow: React.FC<{ task: any; onPress?: () => void }> = ({ task, onPress }) => {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle} numberOfLines={1}>{task.task_name}</Text>
        {!!task.client_name && (
          <Text style={styles.rowSub} numberOfLines={1}>{task.client_name}</Text>
        )}
        {!!task.due_date && (
          <Text style={styles.rowMeta}>Due: {formatDate(task.due_date)}</Text>
        )}
      </View>
      <StatusBadge status={taskStatusKey(task.status)} />
    </Wrapper>
  );
};

export const TimesheetRow: React.FC<{ ts: any; showEmployee?: boolean }> = ({ ts, showEmployee }) => (
  <View style={styles.row}>
    <View style={styles.rowMain}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {showEmployee ? ts.employee_name : ts.task_name}
      </Text>
      <Text style={styles.rowSub} numberOfLines={1}>
        {showEmployee ? ts.task_name : ts.client_name || ts.year_name}
      </Text>
      {!!ts.date && <Text style={styles.rowMeta}>{formatDate(ts.date)}</Text>}
    </View>
    <View style={styles.timeChip}>
      <Text style={styles.timeText}>{ts.total_time || '-'}</Text>
    </View>
  </View>
);

export const AttendanceRow: React.FC<{ att: any }> = ({ att }) => {
  // The API returns the attendance day as `login_date` (YYYY-MM-DD).
  const dateStr = att.login_date || att.date;
  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{dateStr ? formatDate(dateStr) : att.employee_name || '-'}</Text>
        <Text style={styles.rowMeta}>
          In {att.login_time || '-'} · Out {att.logout_time || '-'}
          {att.work_mode === 'remote' ? '  · REMOTE' : ''}
        </Text>
      </View>
      <View style={styles.timeChip}>
        <Text style={styles.timeText}>{att.total_time || '0'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginHorizontal: -4,
  },
  statTile: {
    flexGrow: 1,
    flexBasis: '22%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 4,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginLeft: 8, flex: 1 },
  countChip: {
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  emptyText: { fontSize: 13, color: colors.disabled, paddingVertical: 10, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  rowMeta: { fontSize: 11, color: colors.disabled, marginTop: 2 },
  timeChip: {
    backgroundColor: colors.primary + '10',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeText: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
