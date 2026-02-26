import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { colors } from '../theme';

const PlaceholderScreen: React.FC = () => {
  const route = useRoute();
  return (
    <View style={styles.container}>
      <Icon name="hammer-wrench" size={48} color={colors.disabled} />
      <Text style={styles.title}>{route.name}</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default PlaceholderScreen;
