import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import MetricCard from '../../../components/MetricCard';
import RecentTasks from '../components/RecentTasks';
import RecentTimesheets from '../components/RecentTimesheets';
import AttendanceWidget from '../components/AttendanceWidget';
import UserInfoCard from '../components/UserInfoCard';
import { useDashboard } from '../hooks/useDashboard';
import { useAttendance } from '../../attendance/hooks/useAttendance';
import { formatDateToYYYYMMDD } from '../../../utils/dateFormat';
import { getCurrentLocation, getWorkMode } from '../../../utils/geolocation';

interface MetricDef {
  title: string;
  key: string;
  icon: string;
  color: string;
}

const metricDefs: MetricDef[] = [
  { title: 'Pending', key: 'task_pending', icon: 'clock-alert-outline', color: colors.warning },
  { title: 'In Progress', key: 'task_inprogress', icon: 'progress-clock', color: colors.accent },
  { title: 'Completed', key: 'task_completed', icon: 'check-circle-outline', color: colors.success },
];

const DashboardScreen: React.FC = () => {
  const { metrics, recentTasks, recentTimesheets } = useDashboard();
  const today = formatDateToYYYYMMDD(new Date());
  const { records, todayCheck, clockIn, clockOut } = useAttendance(today);

  const [isActive, setIsActive] = useState(false);
  const [currentAttId, setCurrentAttId] = useState<number | null>(null);
  const [activeElapsedSeconds, setActiveElapsedSeconds] = useState(0);

  useEffect(() => {
    const openRecord = todayCheck.data?.data?.[0];
    if (openRecord && openRecord.logout_time === null) {
      setIsActive(true);
      setCurrentAttId(openRecord.attendance_id);
      // Calculate elapsed seconds from login_time (HH:MM:SS)
      if (openRecord.login_time) {
        const parts = openRecord.login_time.split(':').map(Number);
        const now = new Date();
        const loginDate = new Date();
        loginDate.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
        const diff = Math.max(0, Math.floor((now.getTime() - loginDate.getTime()) / 1000));
        setActiveElapsedSeconds(diff);
      }
    } else {
      setIsActive(false);
      setCurrentAttId(null);
      setActiveElapsedSeconds(0);
    }
  }, [todayCheck.data]);

  // Parse today_work_time "HH:MM:SS" into total seconds for accurate display
  const todayWorkTime = todayCheck.data?.today_work_time || '00:00:00';
  const twParts = todayWorkTime.split(':').map(Number);
  const completedSeconds = (twParts[0] || 0) * 3600 + (twParts[1] || 0) * 60 + (twParts[2] || 0);

  const handleToggle = async () => {
    if (isActive) {
      if (!currentAttId) {
        Toast.show({ type: 'error', text1: 'No active session found' });
        return;
      }
      // Log, don't block: capture location best-effort; never block logout.
      let location = null;
      try {
        location = await getCurrentLocation();
      } catch {
        // geolocation unavailable — still allow logout
      }
      clockOut.mutate(
        { att_id: currentAttId, ...(location || {}) },
        {
          onSuccess: () => {
            setIsActive(false);
            setCurrentAttId(null);
            setActiveElapsedSeconds(0);
          },
        },
      );
    } else {
      // Log, don't block: tag the login office/remote; never block when off-site.
      let location = null;
      try {
        location = await getCurrentLocation();
      } catch {
        // geolocation unavailable — still allow login, recorded as remote
      }
      const work_mode = getWorkMode(location);
      clockIn.mutate(
        { ...(location || {}), work_mode },
        {
          onSuccess: (res) => {
            setCurrentAttId(res.data.data);
            setIsActive(true);
            setActiveElapsedSeconds(0);
          },
        },
      );
    }
  };

  const isLoading = metrics.isLoading;
  const isRefreshing = metrics.isRefetching;

  const onRefresh = () => {
    metrics.refetch();
    recentTasks.refetch();
    recentTimesheets.refetch();
    todayCheck.refetch();
    records.refetch();
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
          {/* User Info */}
          <UserInfoCard />

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

          {/* Attendance Widget */}
          <AttendanceWidget
            isActive={isActive}
            isLoading={clockIn.isPending || clockOut.isPending}
            completedSeconds={completedSeconds}
            activeElapsedSeconds={activeElapsedSeconds}
            onToggle={handleToggle}
          />

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
