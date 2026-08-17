import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPMessageInputProps = {
  maxlength?: number | string;
  dotFill?: boolean;
  mode?: 'box' | 'bottomLine' | 'middleLine';
  modelValue?: string | number;
  /** RN binding alias: source `modelValue` maps to `value`. */
  value?: string | number;
  defaultValue?: string | number;
  breathe?: boolean;
  focus?: boolean;
  bold?: boolean;
  fontSize?: UPDimension;
  activeColor?: string;
  inactiveColor?: string;
  width?: UPDimension;
  disabledKeyboard?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (value: string) => void;
  /** Source `finish` event: fires when input length reaches `maxlength`. */
  onFinish?: (value: string) => void;
  /** Source `input` event: fires on every value change (same timing as `onChange`). */
  onInput?: (value: string) => void;
};

export function UPMessageInput(input: UPMessageInputProps): React.JSX.Element {
  const props = { ...useUPConfig().props.messageInput, ...input } as UPMessageInputProps;
  const external = input.value ?? input.modelValue;
  const [inner, setInner] = useState(String(external ?? input.defaultValue ?? props.modelValue ?? ''));
  const ref = useRef<TextInput>(null);
  const length = Number(props.maxlength);
  const cell = getPx(props.width ?? 80);

  useEffect(() => {
    if (external !== undefined && external !== null) setInner(String(external));
  }, [external]);

  const change = (raw: string) => {
    const next = raw.slice(0, length);
    setInner(next);
    input.onChange?.(next);
    input.onInput?.(next);
    if (next.length === length) input.onFinish?.(next);
  };

  return (
    <Pressable
      onPress={() => {
        if (!props.disabledKeyboard) ref.current?.focus();
      }}
      style={[{ flexDirection: 'row', justifyContent: 'center' }, input.customStyle]}
      testID="up-message-input"
    >
      {Array.from({ length }, (_, index) => {
        const character = inner[index];
        const active = inner.length === index;
        const cellColor = active ? props.activeColor : props.inactiveColor;
        const isMiddle = props.mode === 'middleLine';
        const isBottom = props.mode === 'bottomLine';
        return (
          <View
            key={index}
            style={{
              alignItems: 'center',
              borderRadius: props.mode === 'box' ? 4 : 0,
              borderColor: props.mode === 'box' ? cellColor : undefined,
              borderWidth: props.mode === 'box' ? (active ? 2 : 1) : 0,
              height: cell,
              justifyContent: 'center',
              marginHorizontal: 4,
              position: 'relative',
              width: cell,
            }}
            testID={`up-message-input-box-${index}`}
          >
            {isMiddle ? (
              <View
                style={{
                  backgroundColor: cellColor,
                  height: props.bold ? 4 : 2,
                  opacity: inner.length <= index ? 1 : 0,
                  width: cell - 8,
                }}
              />
            ) : null}
            {isBottom ? (
              <View
                style={{
                  backgroundColor: cellColor,
                  bottom: 0,
                  height: props.bold ? 4 : 2,
                  opacity: inner.length <= index ? 1 : 0,
                  position: 'absolute',
                  width: cell - 8,
                }}
              />
            ) : null}
            <Text
              style={{
                color: props.activeColor,
                fontSize: getPx(props.fontSize ?? 60),
                fontWeight: props.bold ? '700' : '400',
              }}
            >
              {character ? (props.dotFill ? '•' : character) : ''}
            </Text>
            {active && props.breathe && !isBottom && !isMiddle ? (
              <View
                style={{
                  backgroundColor: props.activeColor,
                  bottom: 2,
                  height: 2,
                  opacity: 0.6,
                  position: 'absolute',
                  width: cell - 8,
                }}
              />
            ) : null}
          </View>
        );
      })}
      <TextInput
        autoFocus={props.focus}
        caretHidden={!props.disabledKeyboard}
        editable={!props.disabledKeyboard}
        keyboardType="number-pad"
        maxLength={length}
        onChangeText={change}
        ref={ref}
        style={{ height: 1, opacity: 0, width: 1 }}
        testID="up-message-input-native"
        value={inner}
      />
    </Pressable>
  );
}
