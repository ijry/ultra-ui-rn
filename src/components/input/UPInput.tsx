import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPInputProps = {
  value?: string | number; modelValue?: string | number; defaultValue?: string | number; type?: string;
  fixed?: boolean; disabled?: boolean; disabledColor?: string; clearable?: boolean; onlyClearableOnFocused?: boolean;
  password?: boolean; maxlength?: number | string; placeholder?: string | null; placeholderClass?: string;
  placeholderStyle?: StyleProp<TextStyle>; showWordLimit?: boolean; confirmType?: string; confirmHold?: boolean;
  holdKeyboard?: boolean; focus?: boolean; autoBlur?: boolean; disableDefaultPadding?: boolean; cursor?: number | string;
  cursorSpacing?: number | string; selectionStart?: number | string; selectionEnd?: number | string; adjustPosition?: boolean;
  inputAlign?: 'left' | 'center' | 'right'; fontSize?: UPDimension; color?: string; prefixIcon?: string;
  prefixIconStyle?: StyleProp<TextStyle>; suffixIcon?: string; suffixIconStyle?: StyleProp<TextStyle>;
  border?: 'surround' | 'bottom' | 'none'; readonly?: boolean; shape?: 'circle' | 'square';
  formatter?: (value: string) => string; cursorColor?: string; passwordVisibilityToggle?: boolean;
  customStyle?: StyleProp<ViewStyle>; customClass?: string; prefix?: React.ReactNode; suffix?: React.ReactNode;
  onChange?: (value: string) => void; onFocus?: () => void; onBlur?: (value: string) => void; onConfirm?: (value: string) => void; onClear?: () => void;
};
function keyboardType(type: string): React.ComponentProps<typeof TextInput>['keyboardType'] {
  return type === 'number' || type === 'digit' ? 'decimal-pad' : type === 'idcard' ? 'default' : 'default';
}
export function UPInput(input: UPInputProps): React.JSX.Element {
  const config = useUPConfig(); const props = { ...config.props.input, ...input }; const { colors } = useUPTheme();
  const controlled = input.value ?? input.modelValue; const [inner, setInner] = useState(String(controlled ?? input.defaultValue ?? props.value));
  const [focused, setFocused] = useState(false); const [visible, setVisible] = useState(false);
  useEffect(() => { if (controlled !== undefined) setInner(String(controlled)); }, [controlled]);
  const commit = (raw: string) => { const value = input.formatter?.(raw) ?? raw; setInner(value); input.onChange?.(value); };
  const showClear = props.clearable && !props.readonly && inner !== '' && (!props.onlyClearableOnFocused || focused);
  const isPassword = (props.password || props.type === 'password') && !visible;
  const border: ViewStyle = props.border === 'surround' ? { borderColor: colors.borderColor, borderRadius: props.shape === 'circle' ? 100 : 3, borderWidth: 1 } : props.border === 'bottom' ? { borderBottomColor: colors.borderColor, borderBottomWidth: 1 } : {};
  return <View style={[{ alignItems: 'center', backgroundColor: props.disabled ? props.disabledColor || colors.bgColor : undefined, flexDirection: 'row', height: 40, paddingHorizontal: props.border === 'none' ? 0 : 9, paddingVertical: props.border === 'none' ? 0 : 6 }, border, input.customStyle]} testID="up-input">
    {input.prefix ?? (props.prefixIcon ? <UPIcon customStyle={StyleSheet.flatten(input.prefixIconStyle)} name={props.prefixIcon} size={18} /> : null)}
    <TextInput autoFocus={props.focus} caretHidden={false} cursorColor={props.cursorColor} editable={!props.disabled && !props.readonly} keyboardType={keyboardType(props.type)} maxLength={Number(props.maxlength) < 0 ? undefined : Number(props.maxlength)} onBlur={() => { setFocused(false); input.onBlur?.(inner); }} onChangeText={commit} onFocus={() => { setFocused(true); input.onFocus?.(); }} onSubmitEditing={() => input.onConfirm?.(inner)} placeholder={props.placeholder ?? undefined} placeholderTextColor={colors.tipsColor} returnKeyType={props.confirmType as React.ComponentProps<typeof TextInput>['returnKeyType']} secureTextEntry={isPassword} selection={Number(props.selectionStart) >= 0 && Number(props.selectionEnd) >= 0 ? { start: Number(props.selectionStart), end: Number(props.selectionEnd) } : undefined} style={{ color: props.color || colors.mainColor, flex: 1, fontSize: getPx(props.fontSize), padding: 0, textAlign: props.inputAlign }} testID="up-input-native" value={inner} />
    {showClear ? <Pressable onPress={() => { setInner(''); input.onChange?.(''); input.onClear?.(); }} testID="up-input-clear"><UPIcon color="#ffffff" name="close" size={11} /></Pressable> : null}
    {(props.password || props.type === 'password') && props.passwordVisibilityToggle ? <Pressable onPress={() => setVisible((value) => !value)} testID="up-input-password-toggle"><UPIcon name={visible ? 'eye-off' : 'eye-fill'} size={18} /></Pressable> : null}
    {input.suffix ?? (props.suffixIcon ? <UPIcon customStyle={StyleSheet.flatten(input.suffixIconStyle)} name={props.suffixIcon} size={18} /> : null)}
    {props.showWordLimit ? <Text>{`${inner.length}/${props.maxlength}`}</Text> : null}
  </View>;
}
