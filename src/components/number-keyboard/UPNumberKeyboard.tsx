import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPIcon } from '../icon';
import { useRepeatBackspace } from '../shared/useRepeatBackspace';

export type UPNumberKeyboardMode = 'number' | 'card';
export type UPNumberKeyboardValue = number | '.' | 'X';

export type UPNumberKeyboardProps = {
  mode?: UPNumberKeyboardMode;
  dotDisabled?: boolean;
  random?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (value: UPNumberKeyboardValue) => void;
  onBackspace?: () => void;
};

function shuffled<T>(values: readonly T[], enabled: boolean): T[] {
  if (!enabled) return [...values];
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[nextIndex]] = [result[nextIndex], result[index]];
  }
  return result;
}

function valuesFor(mode: UPNumberKeyboardMode, dotDisabled: boolean, random: boolean): UPNumberKeyboardValue[] {
  const values: UPNumberKeyboardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (mode === 'card') values.push('X');
  else if (!dotDisabled) values.push('.');
  values.push(0);
  return shuffled(values, random);
}

function keyTestId(value: UPNumberKeyboardValue): string {
  return `up-number-keyboard-key-${String(value)}`;
}

export function UPNumberKeyboard(input: UPNumberKeyboardProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.numberKeyboard, ...input } as UPNumberKeyboardProps;
  const mode = props.mode ?? 'number';
  const values = useMemo(
    () => valuesFor(mode, Boolean(props.dotDisabled), Boolean(props.random)),
    [mode, props.dotDisabled, props.random],
  );
  const { start, stop } = useRepeatBackspace(input.onBackspace);
  const firstRows = [values.slice(0, 3), values.slice(3, 6), values.slice(6, 9)];
  const finalValues = values.slice(9);
  const compactNumber = mode === 'number' && Boolean(props.dotDisabled);

  const emit = (value: UPNumberKeyboardValue) => {
    input.onChange?.(value === '.' || value === 'X' ? value : Number(value));
  };

  const key = (value: UPNumberKeyboardValue, wide = false) => (
    <Pressable
      accessibilityLabel={String(value)}
      accessibilityRole="button"
      key={String(value)}
      onPress={() => emit(value)}
      style={[buttonStyle, wide ? { flex: 2 } : { flex: 1 }]}
      testID={keyTestId(value)}
    >
      <Text style={buttonTextStyle}>{value}</Text>
    </Pressable>
  );

  return (
    <View style={[keyboardStyle, input.customStyle]} testID="up-number-keyboard">
      {firstRows.map((row, rowIndex) => (
        <View key={rowIndex} style={rowStyle}>
          {row.map((value) => key(value))}
        </View>
      ))}
      <View style={rowStyle}>
        {finalValues.map((value) => key(value, compactNumber))}
        <Pressable
          accessibilityLabel="backspace"
          accessibilityRole="button"
          onPressIn={start}
          onPressOut={stop}
          style={[buttonStyle, backspaceStyle, { flex: 1 }]}
          testID="up-number-keyboard-backspace"
        >
          <UPIcon color="#303133" name="backspace" size={28} />
        </Pressable>
      </View>
    </View>
  );
}

const keyboardStyle: ViewStyle = {
  backgroundColor: 'rgb(224, 228, 230)',
  paddingHorizontal: 6,
  paddingVertical: 8,
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  gap: 6,
  marginVertical: 4,
};

const buttonStyle: ViewStyle = {
  alignItems: 'center',
  backgroundColor: '#ffffff',
  borderRadius: 4,
  elevation: 1,
  height: 45,
  justifyContent: 'center',
  shadowColor: '#bbbcbe',
  shadowOffset: { height: 2, width: 0 },
  shadowOpacity: 1,
  shadowRadius: 0,
};

const backspaceStyle: ViewStyle = { backgroundColor: 'rgb(200, 202, 210)' };
const buttonTextStyle = { color: '#303133', fontSize: 20, fontWeight: '500' as const };
