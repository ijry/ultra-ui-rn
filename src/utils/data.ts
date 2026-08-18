import { test } from './validation';
import { trim } from './format';
import { getUPConfig } from '../config/store';

/**
 * Generate a uuid string.
 * Mirrors `uni.$u.guid`.
 * @param len uuid length (0 → rfc4122 form)
 * @param firstU prefix with `u`
 * @param radix character base
 */
export function guid(len = 32, firstU = true, radix: number | null = null): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid: string[] = [];
  const base = radix ?? chars.length;
  if (len) {
    for (let i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * base)];
  } else {
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        const r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  if (firstU) {
    uuid.shift();
    return `u${uuid.join('')}`;
  }
  return uuid.join('');
}

/**
 * Random integer in `[min, max]` (inclusive).
 * Mirrors `uni.$u.random`.
 */
export function random(min: number, max: number): number {
  if (min >= 0 && max > 0 && max >= min) {
    const gap = max - min + 1;
    return Math.floor(Math.random() * gap + min);
  }
  return 0;
}

/**
 * Shuffle an array in place.
 * Mirrors `uni.$u.randomArray`.
 */
export function randomArray<T>(array: T[] = []): T[] {
  return array.sort(() => Math.random() - 0.5);
}

/**
 * Deep clone a value.
 * Mirrors `uni.$u.deepClone`.
 */
export function deepClone<T>(obj: T): T {
  if ([null, undefined, NaN, false].includes(obj as never)) return obj;
  if (typeof obj !== 'object' && typeof obj !== 'function') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => (
      typeof item === 'object' && item !== null ? deepClone(item) : item
    )) as T;
  }
  const out: Record<string, unknown> = {};
  for (const key in obj as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as Record<string, unknown>)[key];
      out[key] = typeof value === 'object' && value !== null ? deepClone(value) : value;
    }
  }
  return out as T;
}

function mergeObjects(
  targetOrigin: Record<string, unknown>,
  source: Record<string, unknown>,
  shallow: boolean,
): Record<string, unknown> | boolean {
  const target = shallow ? { ...targetOrigin } : (deepClone(targetOrigin) as Record<string, unknown>);
  if (typeof target !== 'object' || typeof source !== 'object') return false;
  for (const prop in source) {
    if (!Object.prototype.hasOwnProperty.call(source, prop)) continue;
    const sourceValue = source[prop];
    if (prop in target) {
      const targetValue = target[prop];
      if (sourceValue === null) {
        target[prop] = sourceValue;
      } else if (typeof targetValue !== 'object') {
        target[prop] = sourceValue;
      } else if (typeof sourceValue !== 'object') {
        target[prop] = sourceValue;
      } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[prop] = targetValue.concat(sourceValue);
      } else {
        const merged = mergeObjects(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
          shallow,
        );
        target[prop] = merged === false ? {} : merged;
      }
    } else {
      target[prop] = sourceValue;
    }
  }
  return target;
}

/**
 * Deep merge two objects (source into a clone of target).
 * Mirrors `uni.$u.deepMerge`.
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: T): T | boolean {
  return mergeObjects(target, source, false) as T | boolean;
}

/**
 * Shallow merge of two objects.
 * Mirrors `uni.$u.shallowMerge`.
 */
export function shallowMerge<T extends Record<string, unknown>>(target: T, source: T): T | boolean {
  return mergeObjects(target, source, true) as T | boolean;
}

/**
 * Read a nested property from an object by `a.b.c` path.
 * Mirrors `uni.$u.getProperty`.
 */
export function getProperty(obj: unknown, key: string): unknown {
  if (typeof obj !== 'object' || obj === null) return '';
  if (typeof key !== 'string' || key === '') return '';
  if (key.indexOf('.') !== -1) {
    const keys = key.split('.');
    let current: unknown = (obj as Record<string, unknown>)[keys[0]];
    for (let i = 1; i < keys.length; i++) {
      if (current) current = (current as Record<string, unknown>)[keys[i]];
    }
    return current ?? '';
  }
  return (obj as Record<string, unknown>)[key];
}

/**
 * Set a nested property on an object by `a.b.c` path.
 * Mirrors `uni.$u.setProperty`.
 */
export function setProperty(obj: Record<string, unknown>, key: string, value: unknown): void {
  if (typeof obj !== 'object' || obj === null) return;
  const assign = (_obj: Record<string, unknown>, keys: string[], v: unknown): void => {
    if (keys.length === 1) {
      _obj[keys[0]] = v;
      return;
    }
    const k = keys[0];
    if (!_obj[k] || typeof _obj[k] !== 'object') {
      _obj[k] = {};
    }
    const next = keys.slice(1);
    assign(_obj[k] as Record<string, unknown>, next, v);
  };
  if (typeof key !== 'string' || key === '') {
    return;
  }
  if (key.indexOf('.') !== -1) {
    assign(obj, key.split('.'), value);
  } else {
    obj[key] = value;
  }
}

/**
 * Read a nested value by path, returning `undefined` when the path is missing.
 * Mirrors `uni.$u.getValueByPath`.
 */
export function getValueByPath<T = unknown>(obj: unknown, path: string): T | undefined {
  const pathArr = path.split('.');
  return pathArr.reduce<unknown>((acc, curr) => (
    acc && (acc as Record<string, unknown>)[curr] !== undefined
      ? (acc as Record<string, unknown>)[curr]
      : undefined
  ), obj) as T | undefined;
}

/**
 * Add a CSS unit to a value unless it already carries one.
 * Mirrors `uni.$u.addUnit`.
 */
export function addUnit(value: string | number = 'auto', unit = ''): string {
  let finalUnit = unit;
  if (!finalUnit) finalUnit = getUPConfig().config.unit || 'px';
  let finalValue: string | number = value;
  if (finalUnit === 'rpx' && test.number(String(value))) {
    finalValue = Number(value) * 2;
  }
  const str = String(finalValue);
  return test.number(str) ? `${str}${finalUnit}` : str;
}

/**
 * Convert a CSS style string to an object (or object to string).
 * Mirrors `uni.$u.addStyle`.
 */
export function addStyle(
  customStyle: string | Record<string, unknown> | undefined,
  target: 'object' | 'string' = 'object',
): string | Record<string, unknown> | undefined {
  if (
    !customStyle
    || (typeof customStyle === 'object' && target === 'object')
    || (target === 'string' && typeof customStyle === 'string')
  ) {
    return customStyle;
  }
  if (target === 'object') {
    const styleArray = trim(customStyle as string).split(';');
    const style: Record<string, string> = {};
    for (const item of styleArray) {
      if (item) {
        const pair = item.split(':');
        style[trim(pair[0])] = trim(pair[1]);
      }
    }
    return style;
  }
  let string = '';
  if (typeof customStyle === 'object') {
    for (const key of Object.keys(customStyle)) {
      const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      string += `${kebab}:${customStyle[key]};`;
    }
  }
  return trim(string);
}

/**
 * Development-only error log.
 * Mirrors `uni.$u.error`.
 */
export function error(err: unknown): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error(`uView提示：${String(err)}`);
  }
}
