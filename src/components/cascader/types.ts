import type { StyleProp, ViewStyle } from 'react-native';

export type UPCascaderNode = Record<string, unknown>;

export type UPCascaderValue = string | number | boolean | null;

export type UPCascaderPath = readonly UPCascaderValue[];

export type UPCascaderHeaderDirection = 'row' | 'column';

export type UPCascaderKeys = {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
};

export type UPCascaderProps = {
  show?: boolean;
  data?: readonly UPCascaderNode[];
  modelValue?: UPCascaderPath;
  valueKey?: string;
  labelKey?: string;
  childrenKey?: string;
  maskCloseAble?: boolean;
  zIndex?: string | number;
  autoClose?: boolean;
  headerDirection?: UPCascaderHeaderDirection;
  optionsCols?: 1 | 2;
  closeable?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (values: UPCascaderValue[]) => void;
  onConfirm?: (values: UPCascaderValue[]) => void;
  onCancel?: () => void;
  onUpdateModelValue?: (values: UPCascaderValue[]) => void;
  onChangeShow?: (show: boolean) => void;
};

export type UPCascaderState = {
  levels: readonly (readonly UPCascaderNode[])[];
  indexs: readonly number[];
  activeLevel: number;
};
