import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, Menu, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { colors } from '../../../theme';
import AppHeader from '../../../components/AppHeader';
import EmptyState from '../../../components/EmptyState';
import api from '../../../api/client';
import { EP } from '../../../api/endpoints';
import { timesheetApi } from '../../../api/timesheet.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { employeeApi } from '../../../api/employee.api';

// Monday-first, matching the backend's ISO week (moment isoWeek = Mon–Sun).
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ISO week number (Mon–Sun), matching the backend's moment().isoWeek(week_id).
const getWeekNumber = (d: Date) => {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
	date.setUTCDate(date.getUTCDate() - dayNum + 3); // Thursday of this ISO week
	const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
	const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
	firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
	return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
};

// Monday-start week dates (YYYY-MM-DD), matching the backend ISO week range.
const getWeekDates = (d: Date): string[] => {
	const diffToMon = (d.getDay() + 6) % 7; // days since Monday
	const monday = new Date(d);
	monday.setDate(d.getDate() - diffToMon);
	return DAY_LABELS.map((_, i) => {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);
		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, '0');
		const dd = String(date.getDate()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}`;
	});
};

const formatDateLabel = (dateStr: string): string => {
	const d = new Date(dateStr + 'T00:00:00');
	return `${DAY_FULL[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
};

const formatTimeInput = (text: string): string => {
	const digits = text.replace(/\D/g, '').slice(0, 4);
	if (digits.length <= 2) return digits;
	return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

interface Employee {
	employee_id: number;
	name: string;
}

interface TaskEntry {
	task_id: number;
	task_name: string;
	year_name: string | null;
	service_name: string | null;
	service_short_name: string | null;
	ts_id: number | null;
	time: string;
	description: string;
}

interface DayCard {
	dayIdx: number;
	date: string;
	label: string;
	tasks: TaskEntry[];
}

const WeeklyTimesheetScreen: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
	const user = useSelector((s: RootState) => s.auth.user);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [dayCards, setDayCards] = useState<DayCard[]>([]);
	const [selectedDayIdx, setSelectedDayIdx] = useState<number>((new Date().getDay() + 6) % 7);
	const initialDataRef = useRef<string>('');

	const [employees, setEmployees] = useState<Employee[]>([]);
	const [selectedEmpId, setSelectedEmpId] = useState<number | null>(user?.employee_id || null);
	const [menuVisible, setMenuVisible] = useState(false);

	const weekNum = getWeekNumber(currentDate);
	const year = currentDate.getFullYear();
	const weekDates = getWeekDates(currentDate);

	const selectedEmployee = employees.find((e) => e.employee_id === selectedEmpId);

	useEffect(() => {
		const loadEmployees = async () => {
			try {
				// Role-scoped: admins/managers get everyone, ordinary employees
				// get only themselves (backend getEmployeesByPermission rule).
				const res = await employeeApi.getByPermission({ emp_id: user?.employee_id });
				let list = res.data.data || [];
				// getByPermission excludes superadmins from the list; keep the
				// current user selectable so their own name still shows.
				if (user && !list.some((e: any) => String(e.employee_id) === String(user.employee_id))) {
					list = [{ employee_id: user.employee_id, name: user.name }, ...list];
				}
				setEmployees(list);
			} catch {
				setEmployees([]);
			}
		};
		loadEmployees();
	}, []);

	const buildDayCards = useCallback((apiData: any[], dates: string[]): DayCard[] => {
		return dates.map((date, dayIdx) => {
			const tasks: TaskEntry[] = apiData.map((item) => {
				const entry = item.timesheet?.find((t: any) => String(t.date).slice(0, 10) === date);
				return {
					task_id: item.task_id,
					task_name: item.task_name,
					year_name: item.year_name,
					service_name: item.service_name,
					service_short_name: item.service_short_name,
					ts_id: entry?.time_sheet_id || null,
					time: entry?.total_time || '',
					description: entry?.description || '',
				};
			});
			return {
				dayIdx,
				date,
				label: formatDateLabel(date),
				tasks,
			};
		});
	}, []);

	const fetchWeekly = async () => {
		if (!selectedEmpId) return;
		setLoading(true);
		try {
			const res = await api.post(`${EP.TIMESHEET}/viewWeeklyTimesheet`, {
				emp_id: selectedEmpId,
				week_id: weekNum,
				year,
			});
			const data = res.data.data || [];
			const cards = buildDayCards(data, weekDates);
			setDayCards(cards);
			initialDataRef.current = JSON.stringify(cards.map((c) => c.tasks.map((t) => ({ time: t.time, description: t.description }))));
		} catch {
			setDayCards([]);
			initialDataRef.current = '';
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchWeekly(); }, [selectedEmpId, weekNum, year]);

	const changeWeek = (offset: number) => {
		const d = new Date(currentDate);
		d.setDate(d.getDate() + offset * 7);
		setCurrentDate(d);
	};

	const getInitials = (name: string) =>
		name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

	const isDirty = () => {
		const current = JSON.stringify(dayCards.map((c) => c.tasks.map((t) => ({ time: t.time, description: t.description }))));
		return current !== initialDataRef.current;
	};

	const updateTaskField = (dayIdx: number, taskIdx: number, field: 'time' | 'description', value: string) => {
		setDayCards((prev) => {
			const next = [...prev];
			const card = { ...next[dayIdx] };
			const tasks = [...card.tasks];
			tasks[taskIdx] = { ...tasks[taskIdx], [field]: value };
			card.tasks = tasks;
			next[dayIdx] = card;
			return next;
		});
	};

	const getDayTotal = (tasks: TaskEntry[]): string => {
		let totalMins = 0;
		for (const t of tasks) {
			if (t.time && t.time.includes(':')) {
				const [h, m] = t.time.split(':').map(Number);
				totalMins += (h || 0) * 60 + (m || 0);
			}
		}
		if (totalMins === 0) return '';
		const hrs = Math.floor(totalMins / 60);
		const mins = totalMins % 60;
		return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
	};

	const handleSave = async () => {
		if (!selectedEmpId) return;
		setSaving(true);
		try {
			// Regroup by task for the API (one call per task)
			const taskMap: Record<number, { task_id: number; timesheets: any[] }> = {};
			for (const card of dayCards) {
				for (const t of card.tasks) {
					if (!t.time || t.time === '00:00') continue;
					if (!taskMap[t.task_id]) {
						taskMap[t.task_id] = { task_id: t.task_id, timesheets: [] };
					}
					taskMap[t.task_id].timesheets.push({
						ts_id: t.ts_id,
						ts_date: card.date,
						time: t.time,
						description: t.description || null,
					});
				}
			}

			for (const entry of Object.values(taskMap)) {
				await timesheetApi.updateWeekly({
					task_id: entry.task_id,
					emp_id: selectedEmpId,
					timesheets: entry.timesheets,
				});
			}
			Toast.show({ type: 'success', text1: 'Timesheet saved successfully' });
			await fetchWeekly();
		} catch {
			Toast.show({ type: 'error', text1: 'Failed to save timesheet' });
		} finally {
			setSaving(false);
		}
	};

	const selectedCard = dayCards[selectedDayIdx];

	return (
		<View style={styles.flex}>
			{!embedded && <AppHeader title="Weekly Timesheet" showBack showDrawer={false} />}

			{/* Employee Selector */}
			<View style={styles.empSelector}>
				<Menu
					visible={menuVisible}
					onDismiss={() => setMenuVisible(false)}
					anchor={
						<TouchableOpacity style={styles.empButton} onPress={() => setMenuVisible(true)}>
							<Avatar.Text
								size={32}
								label={selectedEmployee ? getInitials(selectedEmployee.name) : 'U'}
								style={styles.empAvatar}
							/>
							<View style={styles.empInfo}>
								<Text style={styles.empName} numberOfLines={1}>
									{selectedEmployee?.name || 'Select Employee'}
								</Text>
								<Text style={styles.empId}>EMP-{selectedEmpId || '—'}</Text>
							</View>
							<Icon name="chevron-down" size={20} color={colors.textSecondary} />
						</TouchableOpacity>
					}
					contentStyle={styles.menuContent}
				>
					<ScrollView style={styles.menuScroll}>
						{employees.map((emp) => (
							<Menu.Item
								key={emp.employee_id}
								title={emp.name}
								leadingIcon={selectedEmpId === emp.employee_id ? 'check' : undefined}
								onPress={() => {
									setSelectedEmpId(emp.employee_id);
									setMenuVisible(false);
								}}
							/>
						))}
					</ScrollView>
				</Menu>
			</View>

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

			{/* Day selector chips */}
			<View style={styles.dayChips}>
				{dayCards.map((card, idx) => {
					const active = selectedDayIdx === idx;
					const hasEntries = card.tasks.some((t) => t.time && t.time !== '00:00');
					const dateNum = card.date.split('-')[2];
					return (
						<TouchableOpacity
							key={card.date}
							style={[styles.dayChip, active && styles.dayChipActive]}
							onPress={() => setSelectedDayIdx(idx)}
							activeOpacity={0.7}
						>
							<Text style={[styles.dayChipLabel, active && styles.dayChipTextActive]}>
								{DAY_LABELS[idx][0]}
							</Text>
							<Text style={[styles.dayChipDate, active && styles.dayChipTextActive]}>{dateNum}</Text>
							<View style={[styles.dayDot, hasEntries && styles.dayDotOn, active && hasEntries && styles.dayDotOnActive]} />
						</TouchableOpacity>
					);
				})}
			</View>

			{loading ? (
				<View style={styles.loader}>
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			) : !selectedCard ? (
				<EmptyState icon="calendar-blank-outline" title="No data" subtitle="No timesheet entries for this week" />
			) : (
				<KeyboardAvoidingView
					style={styles.flex}
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				>
					{/* Selected day header */}
					<View style={styles.dayHeader}>
						<Text style={styles.dayHeaderLabel}>{selectedCard.label}</Text>
						{getDayTotal(selectedCard.tasks) ? (
							<View style={styles.totalBadge}>
								<Text style={styles.totalText}>{getDayTotal(selectedCard.tasks)}</Text>
							</View>
						) : null}
					</View>

					{selectedCard.tasks.length === 0 ? (
						<EmptyState icon="clipboard-text-outline" title="No tasks" subtitle="No tasks for this day" />
					) : (
						<ScrollView contentContainerStyle={styles.dayContent} keyboardShouldPersistTaps="handled">
							{selectedCard.tasks.map((task, taskIdx) => (
								<View key={task.task_id} style={styles.taskCard}>
									<View style={styles.taskHeader}>
										<Icon name="clipboard-text-outline" size={14} color={colors.accent} />
										<Text style={styles.taskName} numberOfLines={1}>{task.task_name}</Text>
										{task.service_short_name || task.service_name ? (
											<Text style={styles.taskService} numberOfLines={1}>
												{task.service_short_name || task.service_name}
											</Text>
										) : null}
									</View>
									<View style={styles.inputRow}>
										<TextInput
											style={styles.timeInput}
											value={task.time}
											placeholder="00:00"
											placeholderTextColor={colors.disabled}
											keyboardType="numeric"
											maxLength={5}
											onChangeText={(text) =>
												updateTaskField(selectedDayIdx, taskIdx, 'time', formatTimeInput(text))
											}
										/>
										<TextInput
											style={styles.descInput}
											value={task.description}
											placeholder="Description"
											placeholderTextColor={colors.disabled}
											onChangeText={(text) => updateTaskField(selectedDayIdx, taskIdx, 'description', text)}
										/>
									</View>
								</View>
							))}
						</ScrollView>
					)}

					{isDirty() && (
						<View style={styles.saveBar}>
							<Button
								mode="contained"
								onPress={handleSave}
								loading={saving}
								disabled={saving}
								style={styles.saveBtn}
								labelStyle={styles.saveBtnLabel}
							>
								Save Changes
							</Button>
						</View>
					)}
				</KeyboardAvoidingView>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: colors.background },
	empSelector: {
		backgroundColor: colors.surface,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	empButton: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	empAvatar: {
		backgroundColor: colors.accent,
	},
	empInfo: {
		flex: 1,
		marginLeft: 12,
	},
	empName: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.text,
	},
	empId: {
		fontSize: 11,
		color: colors.textSecondary,
		marginTop: 1,
	},
	menuContent: {
		backgroundColor: colors.surface,
	},
	menuScroll: {
		maxHeight: 300,
	},
	weekNav: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
		paddingVertical: 12, backgroundColor: colors.surface,
		borderBottomWidth: 1, borderBottomColor: colors.border,
	},
	weekLabel: { fontSize: 15, fontWeight: '600', color: colors.text, marginHorizontal: 8 },
	loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	dayChips: {
		flexDirection: 'row',
		backgroundColor: colors.surface,
		paddingHorizontal: 8,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	dayChip: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8,
		marginHorizontal: 3,
		borderRadius: 10,
		backgroundColor: colors.background,
	},
	dayChipActive: {
		backgroundColor: colors.primary,
	},
	dayChipLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: colors.textSecondary,
	},
	dayChipDate: {
		fontSize: 15,
		fontWeight: '700',
		color: colors.text,
		marginTop: 2,
	},
	dayChipTextActive: {
		color: '#FFF',
	},
	dayDot: {
		width: 5,
		height: 5,
		borderRadius: 3,
		marginTop: 4,
		backgroundColor: 'transparent',
	},
	dayDotOn: {
		backgroundColor: colors.accent,
	},
	dayDotOnActive: {
		backgroundColor: '#FFF',
	},
	dayHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 4,
	},
	dayHeaderLabel: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.text,
	},
	dayContent: {
		padding: 16,
		paddingTop: 8,
		paddingBottom: 100,
	},
	taskCard: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		padding: 14,
		marginBottom: 10,
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 3,
	},
	listContent: {
		padding: 16,
		paddingBottom: 100,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		marginBottom: 12,
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 3,
		overflow: 'hidden',
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		backgroundColor: colors.primary + '08',
	},
	cardHeaderCollapsed: {
		borderBottomWidth: 0,
	},
	dateIconBox: {
		width: 36,
		height: 36,
		borderRadius: 8,
		backgroundColor: colors.primary + '15',
		alignItems: 'center',
		justifyContent: 'center',
	},
	dateInfo: {
		flex: 1,
		marginLeft: 12,
	},
	dateLabel: {
		fontSize: 15,
		fontWeight: '700',
		color: colors.text,
	},
	taskCount: {
		fontSize: 11,
		color: colors.textSecondary,
		marginTop: 2,
	},
	totalBadge: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 4,
		marginLeft: 8,
	},
	totalText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#FFF',
	},
	chevron: {
		marginLeft: 8,
	},
	taskEntries: {
		paddingHorizontal: 12,
	},
	taskRow: {
		paddingVertical: 10,
	},
	taskRowBorder: {
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	taskHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	taskName: {
		fontSize: 13,
		fontWeight: '600',
		color: colors.text,
		marginLeft: 6,
		flex: 1,
	},
	taskService: {
		fontSize: 11,
		color: colors.accent,
		marginLeft: 8,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	timeInput: {
		width: 60,
		height: 36,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 6,
		paddingHorizontal: 8,
		fontSize: 13,
		fontWeight: '600',
		color: colors.text,
		textAlign: 'center',
		backgroundColor: colors.background,
	},
	descInput: {
		flex: 1,
		height: 36,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 6,
		paddingHorizontal: 8,
		fontSize: 12,
		color: colors.text,
		marginLeft: 8,
		backgroundColor: colors.background,
	},
	saveBar: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		backgroundColor: colors.surface,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		elevation: 4,
	},
	saveBtn: {
		backgroundColor: colors.primary,
		borderRadius: 8,
	},
	saveBtnLabel: {
		fontSize: 15,
		fontWeight: '700',
	},
});

export default WeeklyTimesheetScreen;
