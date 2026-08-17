import React, { useEffect, useMemo, useRef, useState } from 'react';
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

export type UPCarKeyboardValue = string | number;

export type UPCarKeyboardProps = {
  random?: boolean;
  autoChange?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (value: UPCarKeyboardValue) => void;
  onBackspace?: () => void;
};

const provinceValues = [
  '京', '沪', '粤', '津', '冀', '豫', '云', '辽', '黑', '湘',
  '皖', '鲁', '苏', '浙', '赣', '鄂', '桂', '甘', '晋', '陕',
  '蒙', '吉', '闽', '贵', '渝', '川', '青', '琼', '宁', '挂',
  '藏', '港', '澳', '新', '使', '学',
] as const;

const alphabeticValues = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
  'Z', 'X', 'C', 'V', 'B', 'N', 'M',
] as const;

function shuffled<T>(values: readonly T[], enabled: boolean): T[] {
  if (!enabled) return [...values];
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[nextIndex]] = [result[nextIndex], result[index]];
  }
  return result;
}

function rowsFor(values: readonly UPCarKeyboardValue[]): UPCarKeyboardValue[][] {
  return [values.slice(0, 10), values.slice(10, 20), values.slice(20, 30), values.slice(30, 36)];
}

export function UPCarKeyboard(input: UPCarKeyboardProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.carKeyboard, ...input } as UPCarKeyboardProps;
  const [alphabetic, setAlphabetic] = useState(false);
  const autoChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceValues: readonly UPCarKeyboardValue[] = alphabetic ? alphabeticValues : provinceValues;
  const rows = useMemo(
    () => rowsFor(shuffled(sourceValues, Boolean(props.random))),
    [alphabetic, props.random, sourceValues],
  );
  const { start, stop } = useRepeatBackspace(input.onBackspace);

  const clearAutoChange = () => {
    if (autoChangeTimer.current !== null) {
      clearTimeout(autoChangeTimer.current);
      autoChangeTimer.current = null;
    }
  };

  useEffect(() => clearAutoChange, []);

  const select = (value: UPCarKeyboardValue) => {
    input.onChange?.(value);
    if (!alphabetic && input.autoChange) {
      clearAutoChange();
      autoChangeTimer.current = setTimeout(() => {
        setAlphabetic(true);
        autoChangeTimer.current = null;
      }, 200);
    }
  };

  const toggleLanguage = () => {
    clearAutoChange();
    setAlphabetic((current) => !current);
  };

  return (
    <View style={[keyboardStyle, input.customStyle]} testID="up-car-keyboard">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={rowStyle}>
          {rowIndex === 3 ? (
            <Pressable
              accessibilityLabel="switch keyboard language"
              accessibilityRole="button"
              onPress={toggleLanguage}
              style={[buttonStyle, specialButtonStyle]}
              testID="up-car-keyboard-language-toggle"
            >
              <Text style={[languageStyle, !alphabetic && languageActiveStyle]}>中</Text>
              <Text style={languageStyle}>/</Text>
              <Text style={[languageStyle, alphabetic && languageActiveStyle]}>英</Text>
            </Pressable>
          ) : null}
          {row.map((value) => (
            <Pressable
              accessibilityLabel={String(value)}
              accessibilityRole="button"
              key={String(value)}
              onPress={() => select(value)}
              style={buttonStyle}
              testID={`up-car-keyboard-key-${String(value)}`}
            >
              <Text style={buttonTextStyle}>{value}</Text>
            </Pressable>
          ))}
          {rowIndex === 3 ? (
            <Pressable
              accessibilityLabel="backspace"
              accessibilityRole="button"
              onPressIn={start}
              onPressOut={stop}
              style={[buttonStyle, specialButtonStyle]}
              testID="up-car-keyboard-backspace"
            >
              <UPIcon color="#303133" name="backspace" size={28} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const keyboardStyle: ViewStyle = {
  backgroundColor: 'rgb(224, 228, 230)',
  paddingVertical: 6,
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  gap: 4,
  justifyContent: 'center',
  marginVertical: 3,
  paddingHorizontal: 4,
};

const buttonStyle: ViewStyle = {
  alignItems: 'center',
  backgroundColor: '#ffffff',
  borderRadius: 4,
  elevation: 1,
  flex: 1,
  height: 40,
  justifyContent: 'center',
  shadowColor: '#999992',
  shadowOffset: { height: 1, width: 0 },
  shadowOpacity: 1,
  shadowRadius: 0,
};

const specialButtonStyle: ViewStyle = { backgroundColor: '#bbbcc6', flex: 2 };
const buttonTextStyle = { color: '#303133', fontSize: 16 };
const languageStyle = { color: '#303133', fontSize: 16 };
const languageActiveStyle = { color: '#2979ff' };
