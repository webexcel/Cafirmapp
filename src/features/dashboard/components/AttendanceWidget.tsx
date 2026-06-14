import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme';
import { formatTimerDisplay } from '../../../utils/dateFormat';

interface AttendanceWidgetProps {
	isActive: boolean;
	isLoading: boolean;
	completedSeconds: number;
	activeElapsedSeconds: number;
	onToggle: () => void;
}

const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ isActive, isLoading, completedSeconds, activeElapsedSeconds, onToggle }) => {
	const [tickSeconds, setTickSeconds] = useState(activeElapsedSeconds);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		if (isActive) {
			setTickSeconds(activeElapsedSeconds);
			intervalRef.current = setInterval(() => {
				setTickSeconds((s) => s + 1);
			}, 1000);
		} else {
			setTickSeconds(0);
		}

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [isActive, activeElapsedSeconds]);

	const totalSeconds = completedSeconds + tickSeconds;

	return (
		<View style={styles.card}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.heading}>Attendance</Text>
				<View style={styles.statusBadge}>
					<View style={[styles.statusDot, { backgroundColor: isActive ? colors.success : colors.disabled }]} />
					<Text style={[styles.statusText, { color: isActive ? colors.success : colors.textSecondary }]}>
						{isActive ? 'Active' : 'Inactive'}
					</Text>
				</View>
			</View>

			{/* Total Time */}
			<View style={styles.timeRow}>
				<Icon name="clock-outline" size={20} color={colors.textSecondary} />
				<Text style={styles.timeValue}>{formatTimerDisplay(totalSeconds)}</Text>
				<Text style={styles.timeLabel}>Total Today</Text>
			</View>

			{/* Toggle Button */}
			<Button
				mode="contained"
				onPress={onToggle}
				loading={isLoading}
				disabled={isLoading}
				style={[styles.clockBtn, { backgroundColor: isActive ? colors.error : colors.success }]}
				contentStyle={{ height: 48 }}
				labelStyle={{ fontWeight: '600', fontSize: 15 }}
				icon={isActive ? 'stop-circle-outline' : 'play-circle-outline'}
			>
				{isActive ? 'Logout' : 'Login'}
			</Button>
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
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	heading: {
		fontSize: 15,
		fontWeight: '700',
		color: colors.text,
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	statusText: {
		fontSize: 12,
		fontWeight: '600',
	},
	timeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 14,
	},
	timeValue: {
		fontSize: 20,
		fontWeight: '700',
		color: colors.text,
		marginLeft: 8,
	},
	timeLabel: {
		fontSize: 12,
		color: colors.textSecondary,
		marginLeft: 8,
	},
	clockBtn: {
		borderRadius: 10,
	},
});

export default AttendanceWidget;
