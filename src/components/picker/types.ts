import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { UPInputProps } from '../input/UPInput';
import type { UPDimension } from '../../utils';

export type UPPickerPrimitive = string | number | boolean;
export type UPPickerOption = UPPickerPrimitive | Record<string, unknown>;
export type UPPickerColumns = readonly (readonly UPPickerOption[])[];

export type UPPickerChangePayload = {
  value: UPPickerOption[];
  index: number;
  indexs: number[];
  values: UPPickerColumns;
  columnIndex: number;
};

export type UPPickerConfirmPayload = {
  indexs: number[];
  value: UPPickerOption[];
  values: UPPickerColumns;
};

export type UPPickerRef = {
  getColumnValues: (columnIndex: number) => readonly UPPickerOption[];
  getIndexs: () => number[];
  getValues: () => UPPickerOption[];
  setColumns: (columns: UPPickerColumns) => void;
  setColumnValues: (columnIndex: number, values: readonly UPPickerOption[]) => void;
  setIndexs: (indexs: readonly number[], setLastIndex?: boolean) => void;
};

export type UPPickerProps = {
  modelValue?: readonly UPPickerPrimitive[];
  hasInput?: boolean;
  inputProps?: Partial<UPInputProps>;
  inputBorder?: UPInputProps['border'];
  disabled?: boolean;
  disabledColor?: string;
  placeholder?: string;
  show?: boolean;
  popupMode?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showToolbar?: boolean;
  title?: string;
  columns?: UPPickerColumns;
  loading?: boolean;
  itemHeight?: UPDimension;
  cancelText?: string;
  confirmText?: string;
  cancelColor?: string;
  confirmColor?: string;
  visibleItemCount?: number | string;
  keyName?: string;
  valueName?: string;
  closeOnClickOverlay?: boolean;
  defaultIndex?: readonly number[];
  immediateChange?: boolean;
  /** Internal composition control; default behavior remains source-compatible close-on-confirm. */
  closeOnConfirm?: boolean;
  toolbarRightSlot?: boolean;
  toolbarRight?: React.ReactNode;
  toolbarBottom?: React.ReactNode;
  trigger?: React.ReactNode | ((label: string) => React.ReactNode);
  zIndex?: number | string;
  bgColor?: string;
  round?: boolean | UPDimension;
  duration?: UPDimension;
  overlayOpacity?: number | string;
  pageInline?: boolean;
  /** @deprecated React Native has no CSS mask-class runtime. */
  maskClass?: string;
  /** @deprecated React Native core cannot apply source CSS picker masks. */
  maskStyle?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (payload: UPPickerChangePayload) => void;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm?: (payload: UPPickerConfirmPayload) => void;
  onUpdateModelValue?: (values: UPPickerPrimitive[]) => void;
  onChangeShow?: (show: boolean) => void;
};
