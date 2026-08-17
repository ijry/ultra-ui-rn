import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { UPInputProps } from '../input/UPInput';
import type { UPDimension } from '../../utils';

export type UPDatetimePickerColumnType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

export type UPDatetimePickerMode =
  | 'date'
  | 'time'
  | 'year-month'
  | 'datetime'
  | 'datehour'
  | 'timesecond'
  | 'datetimesecond';

export type UPDatetimePickerValue = number | string;

export type UPDatetimePickerOption = {
  type: UPDatetimePickerColumnType;
  value: number;
  text: string;
};

export type UPDatetimePickerPayload = {
  value: UPDatetimePickerValue;
  mode: UPDatetimePickerMode;
};

export type UPDatetimePickerFilter = (
  type: UPDatetimePickerColumnType,
  values: readonly string[],
) => readonly string[] | null | undefined;

export type UPDatetimePickerFormatter = (
  type: UPDatetimePickerColumnType,
  value: string,
) => string;

export type UPDatetimePickerDataOptions = {
  value?: UPDatetimePickerValue | null;
  mode?: UPDatetimePickerMode;
  minDate?: number;
  maxDate?: number;
  minHour?: number;
  maxHour?: number;
  minMinute?: number;
  maxMinute?: number;
  minSecond?: number;
  maxSecond?: number;
  filter?: UPDatetimePickerFilter | null;
  formatter?: UPDatetimePickerFormatter | null;
};

export type UPDatetimePickerProps = UPDatetimePickerDataOptions & {
  hasInput?: boolean;
  inputProps?: Partial<UPInputProps>;
  inputBorder?: UPInputProps['border'];
  disabled?: boolean;
  disabledColor?: string;
  placeholder?: string;
  format?: string;
  show?: boolean;
  popupMode?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showToolbar?: boolean;
  toolbarRightSlot?: boolean;
  toolbarRight?: React.ReactNode;
  toolbarBottom?: React.ReactNode;
  /** Legacy source alias for `modelValue`. */
  value?: UPDatetimePickerValue | null;
  modelValue?: UPDatetimePickerValue | null;
  title?: string;
  loading?: boolean;
  itemHeight?: UPDimension;
  cancelText?: string;
  confirmText?: string;
  cancelColor?: string;
  confirmColor?: string;
  visibleItemCount?: number | string;
  closeOnClickOverlay?: boolean;
  defaultIndex?: readonly number[];
  zIndex?: number | string;
  bgColor?: string;
  round?: boolean | UPDimension;
  duration?: UPDimension;
  overlayOpacity?: number | string;
  pageInline?: boolean;
  trigger?: React.ReactNode | ((label: string) => React.ReactNode);
  /** @deprecated React Native has no CSS mask-class runtime. */
  maskClass?: string;
  /** @deprecated React Native core cannot apply source CSS picker masks. */
  maskStyle?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (payload: UPDatetimePickerPayload) => void;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm?: (payload: UPDatetimePickerPayload) => void;
  onUpdateModelValue?: (value: UPDatetimePickerValue) => void;
  onChangeShow?: (show: boolean) => void;
};

export type UPDatetimePickerState = {
  value: UPDatetimePickerValue;
  columns: readonly (readonly UPDatetimePickerOption[])[];
  indexs: readonly number[];
};
