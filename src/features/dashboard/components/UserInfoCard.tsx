import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { colors } from '../../../theme';
import type { RootState } from '../../../app/store';

const UserInfoCard: React.FC = () => {
	const user = useSelector((state: RootState) => state.auth.user);

	const initials = user?.name
		? user.name
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: 'U';

	return (
		<View style={styles.card}>
			<View style={styles.row}>
				<Avatar.Text size={52} label={initials} style={styles.avatar} />
				<View style={styles.info}>
					<Text style={styles.name} numberOfLines={1}>
						{user?.name || 'User'}
					</Text>
					<View style={styles.detailRow}>
						<Icon name="email-outline" size={14} color={colors.textSecondary} />
						<Text style={styles.detailText} numberOfLines={1}>
							{user?.email || ''}
						</Text>
					</View>
					<View style={styles.detailRow}>
						<Icon name="identifier" size={14} color={colors.textSecondary} />
						<Text style={styles.detailText}>
							EMP-{user?.employee_id || '—'}
						</Text>
					</View>
				</View>
			</View>
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
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		backgroundColor: colors.accent,
	},
	info: {
		flex: 1,
		marginLeft: 14,
	},
	name: {
		fontSize: 17,
		fontWeight: '700',
		color: colors.text,
		marginBottom: 4,
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 2,
	},
	detailText: {
		fontSize: 12,
		color: colors.textSecondary,
		marginLeft: 6,
	},
});

export default UserInfoCard;
