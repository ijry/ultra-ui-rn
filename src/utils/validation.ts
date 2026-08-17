export const test = Object.freeze({
  email: (value: string): boolean =>
    /^\w+(([-\w])|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(
      value,
    ),
  mobile: (value: string): boolean => /^1[23456789]\d{9}$/.test(value),
  number: (value: string | number): boolean =>
    /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(String(value)),
  digits: (value: string | number): boolean => /^\d+$/.test(String(value)),
  string: (value: unknown): value is string => typeof value === 'string',
  array: Array.isArray,
  object: (value: unknown): value is Record<string, unknown> =>
    Object.prototype.toString.call(value) === '[object Object]',
  func: (value: unknown): value is (...args: unknown[]) => unknown =>
    typeof value === 'function',
  empty: (value: unknown): boolean => {
    if (value === undefined || value === null || value === false || value === 0) {
      return true;
    }
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    return false;
  },
});
