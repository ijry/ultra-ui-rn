import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import {
  UPFormContext,
  type UPFormError,
  type UPFormRule,
  type UPFormRules,
  type UPRegisteredFormItem,
  type UPValidationTrigger,
} from './context';

export type UPFormValidateOptions = {
  showErrorMsg?: boolean;
};

export type UPFormRef = {
  clearValidate: (props?: string | string[]) => void;
  resetFields: () => void;
  validate: (options?: UPFormValidateOptions) => Promise<true>;
  validateField: (
    props: string | string[],
    trigger?: UPValidationTrigger | null,
    options?: UPFormValidateOptions,
  ) => Promise<true>;
};

export type UPFormProps = PropsWithChildren<{
  model?: Record<string, unknown>;
  rules?: UPFormRules;
  errorType?: 'message' | 'toast' | 'border-bottom' | 'none';
  borderBottom?: boolean;
  labelPosition?: 'left' | 'top';
  labelWidth?: string | number;
  labelAlign?: 'left' | 'center' | 'right';
  labelStyle?: StyleProp<ViewStyle>;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
}>;

function cloneModel<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneModel(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneModel(item)]),
    ) as T;
  }
  return value;
}

function getProperty(model: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, model);
}

function setProperty(model: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.').filter(Boolean);
  const lastKey = keys.pop();
  if (!lastKey) return;
  const target = keys.reduce<Record<string, unknown>>((current, key) => {
    const existing = current[key];
    if (!existing || typeof existing !== 'object') current[key] = {};
    return current[key] as Record<string, unknown>;
  }, model);
  target[lastKey] = cloneModel(value);
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length);
}

function defaultMessage(rule: UPFormRule, prop: string): string {
  if (rule.required) return `${prop} is required`;
  if (rule.pattern) return `${prop} is invalid`;
  if (rule.min !== undefined) return `${prop} is too short`;
  if (rule.max !== undefined) return `${prop} is too long`;
  return `${prop} is invalid`;
}

async function validateRule(
  rule: UPFormRule,
  prop: string,
  value: unknown,
  model: Record<string, unknown>,
): Promise<string | null> {
  if (rule.required && isEmpty(value)) return rule.message ?? defaultMessage(rule, prop);
  if (isEmpty(value)) return null;

  if (rule.pattern) {
    const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
    if (!pattern.test(String(value))) return rule.message ?? defaultMessage(rule, prop);
  }

  const length = typeof value === 'number' ? value : String(value).length;
  if (rule.min !== undefined && length < rule.min) return rule.message ?? defaultMessage(rule, prop);
  if (rule.max !== undefined && length > rule.max) return rule.message ?? defaultMessage(rule, prop);

  if (rule.validator) {
    const result = await rule.validator(value, model);
    if (result === false) return rule.message ?? defaultMessage(rule, prop);
    if (typeof result === 'string') return result;
    if (result instanceof Error) return result.message;
  }
  return null;
}

function ruleTriggered(rule: UPFormRule, trigger: UPValidationTrigger | null): boolean {
  if (!trigger || !rule.trigger) return true;
  return (Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger]).includes(trigger);
}

export const UPForm = forwardRef<UPFormRef, UPFormProps>(function UPForm(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.form, ...input };
  const model = (input.model ?? props.model) as Record<string, unknown>;
  const items = useRef(new Map<string, UPRegisteredFormItem>());
  const originalModel = useRef<Record<string, unknown>>(cloneModel(model));

  useEffect(() => {
    if (items.current.size === 0) originalModel.current = cloneModel(model);
  }, [model]);

  const registerItem = (item: UPRegisteredFormItem): (() => void) => {
    items.current.set(item.prop, item);
    return () => items.current.delete(item.prop);
  };

  const validateField = async (
    fields: string | string[],
    trigger: UPValidationTrigger | null = null,
    options: UPFormValidateOptions = {},
  ): Promise<true> => {
    const errors: UPFormError[] = [];
    for (const prop of Array.isArray(fields) ? fields : [fields]) {
      const item = items.current.get(prop);
      if (!item) continue;
      const formRules = props.rules?.[prop];
      const rules = item.rules.length ? item.rules : formRules ? (Array.isArray(formRules) ? formRules : [formRules]) : [];
      let itemMessage = '';
      for (const rule of rules) {
        if (!ruleTriggered(rule, trigger)) continue;
        const message = await validateRule(rule, prop, getProperty(model, prop), model);
        if (message) {
          itemMessage = message;
          errors.push({ field: prop, message, prop });
          break;
        }
      }
      if (options.showErrorMsg !== false) item.setMessage(itemMessage);
    }
    if (errors.length) return Promise.reject(errors);
    return true;
  };

  useImperativeHandle(ref, () => ({
    clearValidate(fields?: string | string[]) {
      const selected = fields === undefined ? undefined : new Set(Array.isArray(fields) ? fields : [fields]);
      items.current.forEach((item, prop) => {
        if (!selected || selected.has(prop)) item.clearValidate();
      });
    },
    resetFields() {
      items.current.forEach((item) => item.resetField());
    },
    validate(options = {}) {
      return validateField([...items.current.keys()], null, options);
    },
    validateField(fields, trigger = null, options = {}) {
      return validateField(fields, trigger, options);
    },
  }), [model, props.rules]);

  const value = useMemo(() => ({
    borderBottom: props.borderBottom,
    errorType: props.errorType,
    labelAlign: props.labelAlign,
    labelPosition: props.labelPosition,
    labelStyle: props.labelStyle as never,
    labelWidth: Number(props.labelWidth),
    model,
    originalModel: originalModel.current,
    registerItem,
  }), [model, props.borderBottom, props.errorType, props.labelAlign, props.labelPosition, props.labelStyle, props.labelWidth]);

  return <UPFormContext.Provider value={value}><View style={input.customStyle} testID="up-form">{input.children}</View></UPFormContext.Provider>;
});

export { getProperty, setProperty };
