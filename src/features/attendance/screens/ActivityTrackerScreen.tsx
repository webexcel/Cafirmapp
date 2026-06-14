import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import EmptyState from '../../../components/EmptyState';
import OverlayLoader from '../../../components/OverlayLoader';
import { useAttendance } from '../hooks/useAttendance';
import { formatDateToYYYYMMDD, formatTimerDisplay } from '../../../utils/dateFormat';
import { getCurrentLocation, isWithinOffice } from '../../../utils/geolocation';

const ActivityTrackerScreen: React.FC = () => {
  const today = formatDateToYYYYMMDD(new Date());
  const { records, todayCheck, clockIn, clockOut } = useAttendance(today);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentAttId, setCurrentAttId] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const openRecord = todayCheck.data?.data?.[0];
    if (openRecord && openRecord.logout_time === null) {
      setIsActive(true);
      setCurrentAttId(openRecord.attendance_id);
    } else {
      setIsActive(false);
      setCurrentAttId(null);
      setTimerSeconds(0);
    }
  }, [todayCheck.data]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleLogin = async () => {
    let location = null;
    try {
      location = await getCurrentLocation();
    } catch {
      // geolocation failed
    }
    if (!location) {
      Toast.show({ type: 'error', text1: 'You are not in office', text2: 'Location access is required to login' });
      return;
    }
    if (!isWithinOffice(location)) {
      Toast.show({ type: 'error', text1: 'You are not in office', text2: 'You must be within office premises to login' });
      return;
    }
    clockIn.mutate(location, {
      onSuccess: (res) => {
        setCurrentAttId(res.data.data);
        setIsActive(true);
        setTimerSeconds(0);
      },
    });
  };

  const handleLogout = async () => {
    if (!currentAttId) {
      Toast.show({ type: 'error', text1: 'No active session found' });
      return;
    }
    let location = null;
    try {
      location = await getCurrentLocation();
    } catch {
      // geolocation failed
    }
    if (!location) {
      Toast.show({ type: 'error', text1: 'You are not in office', text2: 'Location access is required to logout' });
      return;
    }
    if (!isWithinOffice(location)) {
      Toast.show({ type: 'error', text1: 'You are not in office', text2: 'You must be within office premises to logout' });
      return;
    }
    clockOut.mutate(
      { att_id: currentAttId, ...location },
      {
        onSuccess: () => {
          setIsActive(false);
          setTimerSeconds(0);
          setCurrentAttId(null);
          records.refetch();
        },
      },
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={[styles.cell, styles.snoCell]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.timeCell]}>{item.login_time || '-'}</Text>
      <Text style={[styles.cell, styles.timeCell]}>{item.logout_time || '-'}</Text>
      <Text style={[styles.cell, styles.minCell]}>{item.total_minutes || '0'}</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <AppHeader title="Activity Tracker" />
      <OverlayLoader visible={clockIn.isPending || clockOut.isPending} />

      {/* Timer Section */}
      <View style={styles.timerSection}>
        <View style={styles.timerCircle}>
          <Icon
            name={isActive ? 'timer-sand' : 'timer-outline'}
            size={32}
            color={isActive ? colors.success : colors.textSecondary}
          />
          <Text style={[styles.timerText, isActive && { color: colors.success }]}>
            {formatTimerDisplay(timerSeconds)}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={isActive ? handleLogout : handleLogin}
          disabled={clockIn.isPending || clockOut.isPending}
          style={[styles.clockBtn, { backgroundColor: isActive ? colors.error : colors.success }]}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontWeight: '600', fontSize: 15 }}
          icon={isActive ? 'stop-circle-outline' : 'play-circle-outline'}
        >
          {clockIn.isPending || clockOut.isPending ? 'Please wait...' : isActive ? 'Logout' : 'Login'}
        </Button>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.snoCell]}>#</Text>
        <Text style={[styles.headerCell, styles.timeCell]}>Start Time</Text>
        <Text style={[styles.headerCell, styles.timeCell]}>End Time</Text>
        <Text style={[styles.headerCell, styles.minCell]}>Minutes</Text>
      </View>

      <FlatList
        data={records.data || []}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={records.isRefetching}
        onRefresh={() => records.refetch()}
        ListEmptyComponent={
          records.isLoading ? null : <EmptyState icon="calendar-blank-outline" title="No records" subtitle="No attendance records for today" />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  timerSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  timerCircle: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  timerText: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 4 },
  clockBtn: { borderRadius: 10, minWidth: 180 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: colors.primary,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  headerCell: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  snoCell: { width: 40, textAlign: 'center' },
  timeCell: { flex: 1, textAlign: 'center' },
  minCell: { width: 70, textAlign: 'center' },
  listContent: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowEven: { backgroundColor: colors.surface },
  cell: { fontSize: 13, color: colors.text },
});

export default ActivityTrackerScreen;
