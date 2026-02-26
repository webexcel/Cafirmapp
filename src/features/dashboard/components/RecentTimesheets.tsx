import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';

interface TimesheetEntry {
  task_name: string;
  task_description: string;
  total_time: string;
}

interface RecentTimesheetsProps {
  data: TimesheetEntry[];
}

const RecentTimesheets: React.FC<RecentTimesheetsProps> = ({ data }) => {
  const renderItem = ({ item }: { item: TimesheetEntry }) => (
    <View style={styles.item}>
      <View style={styles.iconContainer}>
        <Icon name="clock-outline" size={20} color={colors.success} />
      </View>
      <View style={styles.content}>
        <Text style={styles.taskName} numberOfLines={1}>{item.task_name}</Text>
        <Text style={styles.description} numberOfLines={1}>{item.task_description}</Text>
      </View>
      <View style={styles.timeBox}>
        <Text style={styles.time}>{item.total_time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Recent Timesheet</Text>
      <FlatList
        data={data}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No recent timesheets</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeBox: {
    backgroundColor: colors.primary + '10',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  empty: {
    fontSize: 13,
    color: colors.disabled,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default RecentTimesheets;
