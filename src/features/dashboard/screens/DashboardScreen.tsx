import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import MetricCard from '../../../components/MetricCard';
import RecentTasks from '../components/RecentTasks';
import RecentTimesheets from '../components/RecentTimesheets';
import { useDashboard } from '../hooks/useDashboard';

interface MetricDef {
  title: string;
  key: string;
  icon: string;
  color: string;
}

const metricDefs: MetricDef[] = [
  { title: 'Employees', key: 'employee_count', icon: 'account-group-outline', color: colors.accent },
  { title: 'Clients', key: 'client_count', icon: 'domain', color: '#1ABC9C' },
  { title: 'Services', key: 'service_count', icon: 'briefcase-outline', color: '#E91E63' },
  { title: 'Pending', key: 'task_pending', icon: 'clock-alert-outline', color: colors.warning },
  { title: 'In Progress', key: 'task_inprogress', icon: 'progress-clock', color: colors.accent },
  { title: 'Completed', key: 'task_completed', icon: 'check-circle-outline', color: colors.success },
  { title: 'Attendance', key: 'today_attendance', icon: 'calendar-check', color: '#1ABC9C' },
];

const DashboardScreen: React.FC = () => {
  const { metrics, recentTasks, recentTimesheets } = useDashboard();

  const isLoading = metrics.isLoading;
  const isRefreshing = metrics.isRefetching;

  const onRefresh = () => {
    metrics.refetch();
    recentTasks.refetch();
    recentTimesheets.refetch();
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Dashboard" />

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {/* Metric Cards Grid */}
          <View style={styles.metricsGrid}>
            {metricDefs.map((m) => (
              <View key={m.key} style={styles.metricWrapper}>
                <MetricCard
                  title={m.title}
                  value={metrics.data?.[m.key] ?? 0}
                  icon={m.icon}
                  color={m.color}
                />
              </View>
            ))}
          </View>

          {/* Recent Tasks */}
          {recentTasks.isLoading ? (
            <ActivityIndicator style={styles.sectionLoader} color={colors.primary} />
          ) : (
            <RecentTasks data={recentTasks.data || []} />
          )}

          {/* Recent Timesheets */}
          {recentTimesheets.isLoading ? (
            <ActivityIndicator style={styles.sectionLoader} color={colors.primary} />
          ) : (
            <RecentTimesheets data={recentTimesheets.data || []} />
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  metricWrapper: {
    width: '33.33%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  sectionLoader: {
    marginVertical: 24,
  },
});

export default DashboardScreen;
