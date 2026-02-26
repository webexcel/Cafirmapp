import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title = 'No data found',
  subtitle = 'There are no records to display.',
}) => (
  <View style={styles.container}>
    <Icon name={icon} size={56} color={colors.disabled} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    color: colors.disabled,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default EmptyState;
