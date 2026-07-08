import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { formatDateToYYYYMMDD } from '../utils/dateFormat';
import { colors } from '../theme';

interface Props {
  value: string; // stored as YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

// Tappable date field that opens a native date picker and keeps the value as a
// YYYY-MM-DD string, matching the shape every screen already sends to the API.
const DatePickerField: React.FC<Props> = ({ value, onChange, placeholder = 'YYYY-MM-DD' }) => {
  const [open, setOpen] = useState(false);

  // Parse "YYYY-MM-DD" as a local date (avoid the UTC shift of new Date(str)).
  const toDate = (v: string): Date => {
    if (!v) return new Date();
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            value={value}
            editable={false}
            placeholder={placeholder}
            right={<TextInput.Icon icon="calendar" />}
            style={styles.input}
            outlineStyle={styles.outline}
          />
        </View>
      </Pressable>
      <DatePicker
        modal
        open={open}
        date={toDate(value)}
        mode="date"
        onConfirm={(d) => {
          setOpen(false);
          onChange(formatDateToYYYYMMDD(d));
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: colors.surface, fontSize: 13, height: 44 },
  outline: { borderRadius: 8 },
});

export default DatePickerField;
