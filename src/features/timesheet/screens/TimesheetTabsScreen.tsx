import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import WeeklyTimesheetScreen from './WeeklyTimesheetScreen';

// The "Timesheet" menu entry shows the weekly editor only (the List view was
// removed). WeeklyTimesheetScreen is rendered embedded so its own header is
// suppressed and this screen supplies the "Timesheet" header.
const TimesheetTabsScreen: React.FC = () => (
  <View style={styles.flex}>
    <AppHeader title="Timesheet" showBack showDrawer={false} />
    <View style={styles.flex}>
      <WeeklyTimesheetScreen embedded />
    </View>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
});

export default TimesheetTabsScreen;
