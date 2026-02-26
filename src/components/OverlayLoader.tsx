import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface OverlayLoaderProps {
  visible: boolean;
}

const OverlayLoader: React.FC<OverlayLoaderProps> = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    elevation: 4,
  },
});

export default OverlayLoader;
