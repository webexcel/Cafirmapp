import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color = colors.accent }) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.title} numberOfLines={1}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default MetricCard;
