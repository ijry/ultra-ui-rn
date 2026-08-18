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
  isEmpty: (value: unknown): boolean => test.empty(value),
  url: (value: string): boolean =>
    /^((https|http|ftp|rtsp|mms):\/\/)(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?(([0-9]{1,3}.){3}[0-9]{1,3}|([0-9a-zA-Z_!~*'()-]+.)*([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z].[a-zA-Z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+\/?)$/.test(value),
  date: (value: string | number): boolean => {
    if (!value) return false;
    if (typeof value === 'number') {
      if (value.toString().length !== 10 && value.toString().length !== 13) return false;
      return !Number.isNaN(new Date(value).getTime());
    }
    const numV = Number(value);
    if (!Number.isNaN(numV)) {
      if (numV.toString().length === 10 || numV.toString().length === 13) {
        return !Number.isNaN(new Date(numV).getTime());
      }
    }
    if (value.length < 10 || value.length > 19) return false;
    const dateRegex = /^\d{4}[-\/]\d{2}[-\/]\d{2}( \d{1,2}:\d{2}(:\d{2})?)?$/;
    if (!dateRegex.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
  },
  dateISO: (value: string): boolean =>
    /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value),
  idCard: (value: string): boolean =>
    /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(value),
  carNo: (value: string): boolean => {
    const xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    const creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    if (value.length === 7) return creg.test(value);
    if (value.length === 8) return xreg.test(value);
    return false;
  },
  amount: (value: string): boolean =>
    /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value),
  chinese: (value: string): boolean => /^[\u4e00-\u9fa5]+$/gi.test(value),
  letter: (value: string): boolean => /^[a-zA-Z]*$/.test(value),
  enOrNum: (value: string): boolean => /^[0-9a-zA-Z]*$/g.test(value),
  contains: (value: string, param: string): boolean => value.indexOf(param) >= 0,
  range: (value: number, param: readonly [number, number]): boolean =>
    value >= param[0] && value <= param[1],
  rangeLength: (value: { length: number }, param: readonly [number, number]): boolean =>
    value.length >= param[0] && value.length <= param[1],
  landline: (value: string): boolean => /^\d{3,4}-\d{7,8}(-\d{3,4})?$/.test(value),
  jsonString: (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    try {
      const obj = JSON.parse(value);
      return typeof obj === 'object' && obj !== null;
    } catch {
      return false;
    }
  },
  objectPromise: (value: unknown): boolean =>
    Object.prototype.toString.call(value) === '[object Promise]',
  code: (value: string, len = 6): boolean => new RegExp(`^\\d{${len}}$`).test(value),
});
