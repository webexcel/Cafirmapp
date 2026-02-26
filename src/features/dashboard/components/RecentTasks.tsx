import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import { formatDate } from '../../../utils/dateFormat';

interface Task {
  task_name: string;
  description: string;
  due_date: string;
  assigned_to?: { emp_name: string; photo?: string }[];
}

interface RecentTasksProps {
  data: Task[];
}

const RecentTasks: React.FC<RecentTasksProps> = ({ data }) => {
  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.item}>
      <View style={styles.iconContainer}>
        <Icon name="clipboard-text-outline" size={20} color={colors.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.taskName} numberOfLines={1}>{item.task_name}</Text>
        <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
        <View style={styles.footer}>
          {item.assigned_to && item.assigned_to.length > 0 && (
            <Text style={styles.assignee} numberOfLines={1}>
              {item.assigned_to.map((a) => a.emp_name).join(', ')}
            </Text>
          )}
          <Text style={styles.date}>{formatDate(item.due_date)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Recent Tasks</Text>
      <FlatList
        data={data}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No recent tasks</Text>
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
    paddingVertical: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.accent + '15',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  assignee: {
    fontSize: 11,
    color: colors.accent,
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
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

export default RecentTasks;
