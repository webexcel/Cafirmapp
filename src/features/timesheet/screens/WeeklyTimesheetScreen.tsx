import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import EmptyState from '../../../components/EmptyState';
import api from '../../../api/client';
import { EP } from '../../../api/endpoints';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getWeekNumber = (d: Date) => {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
};

const WeeklyTimesheetScreen: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekNum = getWeekNumber(currentDate);
  const year = currentDate.getFullYear();

  const fetchWeekly = async () => {
    setLoading(true);
    try {
      const res = await api.post(`${EP.TIMESHEET}/getWeeklyTimesheet`, {
        emp_id: user?.employee_id,
        week_id: weekNum,
        year,
      });
      setWeekData(res.data.data || []);
    } catch {
      setWeekData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeekly(); }, [weekNum, year]);

  const changeWeek = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset * 7);
    setCurrentDate(d);
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Weekly Timesheet" showBack showDrawer={false} />

      {/* Week Navigator */}
      <View style={styles.weekNav}>
        <Button mode="text" onPress={() => changeWeek(-1)} compact>
          <Icon name="chevron-left" size={22} color={colors.primary} />
        </Button>
        <Text style={styles.weekLabel}>Week {weekNum}, {year}</Text>
        <Button mode="text" onPress={() => changeWeek(1)} compact>
          <Icon name="chevron-right" size={22} color={colors.primary} />
        </Button>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : weekData.length === 0 ? (
        <EmptyState icon="calendar-blank-outline" title="No data" subtitle="No timesheet entries for this week" />
      ) : (
        <ScrollView horizontal contentContainerStyle={styles.tableContainer}>
          <View>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.cell, styles.taskCell, styles.headerText]}>Task</Text>
              {DAY_LABELS.map((d) => (
                <Text key={d} style={[styles.cell, styles.dayCell, styles.headerText]}>{d}</Text>
              ))}
            </View>

            {/* Data Rows */}
            {weekData.map((row: any, idx: number) => (
              <View key={idx} style={[styles.dataRow, idx % 2 === 0 && styles.evenRow]}>
                <Text style={[styles.cell, styles.taskCell]} numberOfLines={2}>
                  {row.task_name}{row.year_name ? `\n${row.year_name}` : ''}
                </Text>
                {DAY_LABELS.map((_, di) => {
                  const entry = row.timesheet?.find((t: any) => new Date(t.date).getDay() === di);
                  return (
                    <Text key={di} style={[styles.cell, styles.dayCell]}>
                      {entry?.total_time || '-'}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  weekNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  weekLabel: { fontSize: 15, fontWeight: '600', color: colors.text, marginHorizontal: 8 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tableContainer: { padding: 12 },
  headerRow: {
    flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 8,
    paddingVertical: 10, marginBottom: 4,
  },
  headerText: { color: '#FFF', fontWeight: '600' },
  dataRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  evenRow: { backgroundColor: colors.surface },
  cell: { paddingHorizontal: 8, fontSize: 12, color: colors.text, textAlign: 'center' },
  taskCell: { width: 140, textAlign: 'left' },
  dayCell: { width: 60 },
});

export default WeeklyTimesheetScreen;
