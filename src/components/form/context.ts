import { createContext, useContext } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

export type UPValidationTrigger = 'blur' | 'change' | string;

export type UPFormRule = {
  required?: boolean;
  message?: string;
  pattern?: RegExp | string;
  min?: number;
  max?: number;
  trigger?: UPValidationTrigger | UPValidationTrigger[];
  validator?: (
    value: unknown,
    model: Record<string, unknown>,
  ) => boolean | string | Error | Promise<boolean | string | Error>;
};

export type UPFormRules = Record<string, UPFormRule | UPFormRule[]>;

export type UPFormError = {
  field: string;
  message: string;
  prop: string;
};

export type UPRegisteredFormItem = {
  clearValidate: () => void;
  prop: string;
  resetField: () => void;
  rules: UPFormRule[];
  setMessage: (message: string) => void;
};

export type UPFormContextValue = {
  borderBottom: boolean;
  errorType: 'message' | 'toast' | 'border-bottom' | 'none';
  labelAlign: 'left' | 'center' | 'right';
  labelPosition: 'left' | 'top';
  labelStyle: StyleProp<TextStyle>;
  labelWidth: number;
  model: Record<string, unknown>;
  originalModel: Record<string, unknown>;
  registerItem: (item: UPRegisteredFormItem) => () => void;
};

export const UPFormContext = createContext<UPFormContextValue | null>(null);

export function useUPFormContext(): UPFormContextValue | null {
  return useContext(UPFormContext);
}
