import React from 'react';
import { Searchbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { colors } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => (
  <Searchbar
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    style={styles.bar}
    inputStyle={styles.input}
    iconColor={colors.textSecondary}
    elevation={0}
  />
);

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    height: 44,
  },
  input: {
    fontSize: 14,
    minHeight: 44,
  },
});

export default SearchBarComponent;
