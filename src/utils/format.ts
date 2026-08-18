import { round } from './calc';

/**
 * Format a date/time value as a string.
 * Mirrors `uni.$u.timeFormat` (uview-plus `libs/function/index.js`).
 * @param dateTime timestamp, date string or Date
 * @param formatStr format rules like `yyyy-mm-dd` or `yyyy年mm月dd日 hh时MM分ss秒`
 */
export function timeFormat(dateTime: string | number | Date | null = null, formatStr = 'yyyy-mm-dd'): string {
  let date: Date;
  if (!dateTime) {
    date = new Date();
  } else if (/^\d{10}$/.test(String(dateTime).trim())) {
    // unix seconds → milliseconds
    date = new Date(Number(dateTime) * 1000);
  } else if (typeof dateTime === 'string' && /^\d+$/.test(dateTime.trim())) {
    date = new Date(Number(dateTime));
  } else if (
    typeof dateTime === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/.test(dateTime)
  ) {
    date = new Date(dateTime);
  } else {
    // Safari/WebKit only parses `/` separators
    date = new Date(typeof dateTime === 'string' ? dateTime.replace(/-/g, '/') : dateTime);
  }

  const timeSource: Record<string, string> = {
    y: date.getFullYear().toString(),
    m: String(date.getMonth() + 1).padStart(2, '0'),
    d: String(date.getDate()).padStart(2, '0'),
    h: String(date.getHours()).padStart(2, '0'),
    M: String(date.getMinutes()).padStart(2, '0'),
    s: String(date.getSeconds()).padStart(2, '0'),
  };
  let result = formatStr;
  for (const key in timeSource) {
    const [ret] = new RegExp(`${key}+`).exec(result) || [];
    if (ret) {
      const beginIndex = key === 'y' && ret.length === 2 ? 2 : 0;
      result = result.replace(ret, timeSource[key].slice(beginIndex));
    }
  }
  return result;
}

/**
 * Convert a timestamp to a "time ago" string (`刚刚`, `x分钟前`, ...).
 * Mirrors `uni.$u.timeFrom`.
 * @param timestamp timestamp (seconds or milliseconds)
 * @param format format string used beyond the relative window, or `false` to always show relative time
 */
export function timeFrom(timestamp: string | number | null = null, format: string | false = 'yyyy-mm-dd'): string {
  let ts = timestamp == null ? Number(new Date()) : parseInt(String(timestamp), 10);
  if (String(ts).length === 10) ts *= 1000;
  let timer = new Date().getTime() - ts;
  timer = parseInt(String(timer / 1000), 10);
  let tips = '';
  if (timer < 300) {
    tips = '刚刚';
  } else if (timer >= 300 && timer < 3600) {
    tips = `${parseInt(String(timer / 60), 10)}分钟前`;
  } else if (timer >= 3600 && timer < 86400) {
    tips = `${parseInt(String(timer / 3600), 10)}小时前`;
  } else if (timer >= 86400 && timer < 2592000) {
    tips = `${parseInt(String(timer / 86400), 10)}天前`;
  } else if (format === false) {
    if (timer >= 2592000 && timer < 365 * 86400) {
      tips = `${parseInt(String(timer / (86400 * 30)), 10)}个月前`;
    } else {
      tips = `${parseInt(String(timer / (86400 * 365)), 10)}年前`;
    }
  } else {
    tips = timeFormat(ts, format);
  }
  return tips;
}

/**
 * Format a number with decimals and thousands separators.
 * Mirrors `uni.$u.priceFormat`.
 */
export function priceFormat(
  number: string | number,
  decimals = 0,
  decimalPoint = '.',
  thousandsSeparator = ',',
): string {
  const cleaned = `${number}`.replace(/[^0-9+-Ee.]/g, '');
  const n = !isFinite(+cleaned) ? 0 : +cleaned;
  const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
  const sep = typeof thousandsSeparator === 'undefined' ? ',' : thousandsSeparator;
  const dec = typeof decimalPoint === 'undefined' ? '.' : decimalPoint;
  let s: string[] = (prec ? round(n, prec).toString() : `${Math.round(n)}`).split('.');
  const re = /(-?\d+)(\d{3})/;
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, `$1${sep}$2`);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

/**
 * Pad a value with a leading zero to two digits.
 * Mirrors `uni.$u.padZero`.
 */
export function padZero(value: string | number): string {
  return `00${value}`.slice(-2);
}

/**
 * Resolve a duration value to ms/s. `unit=true` returns a string form,
 * `unit=false` returns a number of milliseconds.
 * Mirrors `uni.$u.getDuration`.
 */
export function getDuration(value: string | number, unit = true): string | number {
  const valueNum = parseInt(String(value), 10);
  if (unit) {
    if (/s$/.test(String(value))) return String(value);
    return valueNum > 30 ? `${valueNum}ms` : `${valueNum}s`;
  }
  if (/ms$/.test(String(value))) return valueNum;
  if (/s$/.test(String(value))) return valueNum > 30 ? valueNum : valueNum * 1000;
  return valueNum;
}

/**
 * Remove whitespace from a string. `pos`: both | left | right | all.
 * Mirrors `uni.$u.trim`.
 */
export function trim(str: string | number, pos: 'both' | 'left' | 'right' | 'all' = 'both'): string {
  const value = String(str);
  if (pos === 'both') return value.replace(/^\s+|\s+$/g, '');
  if (pos === 'left') return value.replace(/^\s*/, '');
  if (pos === 'right') return value.replace(/(\s*$)/g, '');
  if (pos === 'all') return value.replace(/\s+/g, '');
  return value;
}

/**
 * Serialize an object into a URL query string.
 * Mirrors `uni.$u.queryParams`.
 * @param data object to serialize
 * @param isPrefix prefix with `?`
 * @param arrayFormat indices | brackets | repeat | comma
 */
export function queryParams(
  data: Record<string, unknown> = {},
  isPrefix = true,
  arrayFormat: 'indices' | 'brackets' | 'repeat' | 'comma' = 'brackets',
): string {
  const prefix = isPrefix ? '?' : '';
  const result: string[] = [];
  for (const key in data) {
    const value = data[key];
    if (value === '' || value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (arrayFormat === 'indices') {
        value.forEach((item, index) => result.push(`${key}[${index}]=${String(item)}`));
      } else if (arrayFormat === 'repeat') {
        value.forEach((item) => result.push(`${key}=${String(item)}`));
      } else if (arrayFormat === 'comma') {
        let commaStr = '';
        value.forEach((item) => {
          commaStr += (commaStr ? ',' : '') + String(item);
        });
        result.push(`${key}=${commaStr}`);
      } else {
        value.forEach((item) => result.push(`${key}[]=${String(item)}`));
      }
    } else {
      result.push(`${key}=${String(value)}`);
    }
  }
  return result.length ? prefix + result.join('&') : '';
}

/**
 * Map a theme type to its icon name.
 * Mirrors `uni.$u.type2icon`.
 */
export function type2icon(
  type: 'primary' | 'info' | 'error' | 'warning' | 'success' | string = 'success',
  fill = false,
): string {
  if (!['primary', 'info', 'error', 'warning', 'success'].includes(type)) type = 'success';
  let iconName = '';
  switch (type) {
    case 'primary':
    case 'info':
      iconName = 'info-circle';
      break;
    case 'error':
      iconName = 'close-circle';
      break;
    case 'warning':
      iconName = 'error-circle';
      break;
    default:
      iconName = 'checkmark-circle';
  }
  if (fill) iconName += '-fill';
  return iconName;
}
