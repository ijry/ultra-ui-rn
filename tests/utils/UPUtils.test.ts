import {
  addStyle,
  addUnit,
  deepClone,
  deepMerge,
  divide,
  genLightColor,
  getDuration,
  getProperty,
  getValueByPath,
  guid,
  getWindowInfo,
  minus,
  os,
  padZero,
  plus,
  priceFormat,
  queryParams,
  random,
  randomArray,
  range,
  setProperty,
  shallowMerge,
  sleep,
  sys,
  test,
  timeFormat,
  timeFrom,
  times,
  trim,
  type2icon,
} from '../../src/utils';

describe('P52 $u utility library (format)', () => {
  it('timeFormat mirrors uni.$u.timeFormat', () => {
    const ts = new Date(2024, 4, 3, 9, 30, 15).getTime();
    expect(timeFormat(ts, 'yyyy-mm-dd')).toBe('2024-05-03');
    expect(timeFormat(ts, 'yyyy年mm月dd日 hh时MM分ss秒')).toBe('2024年05月03日 09时30分15秒');
    expect(timeFormat(ts / 1000, 'yyyy-mm-dd')).toBe('2024-05-03'); // seconds input
    expect(timeFormat('2024-05-03', 'mm/dd')).toBe('05/03');
  });

  it('timeFrom returns relative labels then falls back to format', () => {
    expect(timeFrom(Date.now(), false)).toBe('刚刚');
    expect(timeFrom(Date.now() - 10 * 60 * 1000, false)).toBe('10分钟前');
    expect(timeFrom(new Date(2020, 0, 1).getTime(), 'yyyy-mm-dd')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('priceFormat adds thousands separators and decimals', () => {
    expect(priceFormat(1234567.891, 2)).toBe('1,234,567.89');
    expect(priceFormat('1234.5', 2)).toBe('1,234.50');
  });

  it('padZero and getDuration match source semantics', () => {
    expect(padZero(5)).toBe('05');
    expect(padZero('9')).toBe('09');
    expect(getDuration(100)).toBe('100ms');
    expect(getDuration(20)).toBe('20s');
    expect(getDuration(20, false)).toBe(20);
    expect(getDuration('2s', false)).toBe(2000);
  });

  it('trim, queryParams, type2icon port faithfully', () => {
    expect(trim('  ab  ')).toBe('ab');
    expect(trim('a b', 'all')).toBe('ab');
    expect(queryParams({ a: 1, b: 'x', skip: '', list: [1, 2] })).toBe('?a=1&b=x&list[]=1&list[]=2');
    expect(queryParams({ list: [1, 2] }, true, 'comma')).toBe('?list=1,2');
    expect(type2icon('error')).toBe('close-circle');
    expect(type2icon('primary', true)).toBe('info-circle-fill');
  });
});

describe('P52 $u utility library (data)', () => {
  it('guid/random/randomArray behave like the source', () => {
    expect(guid(16)).toMatch(/^u[0-9a-zA-Z]{15}$/);
    expect(guid(0)).toMatch(/^u[0-9a-zA-Z-]{35}$/);
    expect(guid(16, false)).toMatch(/^[0-9a-zA-Z]{16}$/);
    expect(random(1, 10)).toBeGreaterThanOrEqual(1);
    expect(random(1, 10)).toBeLessThanOrEqual(10);
    expect(randomArray([1, 2, 3])).toHaveLength(3);
  });

  it('deepClone does not share references', () => {
    const source = { a: 1, nested: { b: [1, 2] } };
    const clone = deepClone(source) as typeof source;
    clone.nested.b.push(3);
    expect(source.nested.b).toEqual([1, 2]);
  });

  it('deepMerge concats arrays and overwrites scalars', () => {
    const merged = deepMerge({ a: 1, list: [1], nested: { x: 1 } }, { list: [2], nested: { y: 2 } });
    expect(merged).toEqual({ a: 1, list: [1, 2], nested: { x: 1, y: 2 } });
  });

  it('shallowMerge keeps source values on conflict', () => {
    const merged = shallowMerge({ a: 1 }, { a: 2, b: 3 });
    expect(merged).toEqual({ a: 2, b: 3 });
  });

  it('getProperty/setProperty/getValueByPath traverse dot paths', () => {
    const obj = { user: { name: 'Ada' } };
    expect(getProperty(obj, 'user.name')).toBe('Ada');
    expect(getValueByPath(obj, 'user.name')).toBe('Ada');
    expect(getValueByPath(obj, 'user.missing')).toBeUndefined();
    setProperty(obj, 'user.age', 30);
    expect(obj.user).toEqual({ name: 'Ada', age: 30 });
  });

  it('addUnit and addStyle match source conversions', () => {
    expect(addUnit(20)).toBe('20px');
    expect(addUnit('50%')).toBe('50%');
    expect(addStyle('color:red;font-size:12px')).toEqual({ color: 'red', 'font-size': '12px' });
    expect(addStyle({ color: 'red', fontSize: 12 }, 'string')).toBe('color:red;font-size:12;');
  });
});

describe('P52 $u utility library (calc & validation)', () => {
  it('float-safe arithmetic avoids IEEE-754 errors', () => {
    expect(plus(0.1, 0.2)).toBeCloseTo(0.3, 10);
    expect(minus(1, 0.9)).toBeCloseTo(0.1, 10);
    expect(times(0.1, 0.2)).toBeCloseTo(0.02, 10);
    expect(divide(0.3, 0.1)).toBeCloseTo(3, 10);
  });

  it('new validators cover the source test.js surface', () => {
    expect(test.url('https://uviewui.com/path?a=1')).toBe(true);
    expect(test.url('not-a-url')).toBe(false);
    expect(test.date('2024-05-03')).toBe(true);
    expect(test.date('2024-05-03 09:30:15')).toBe(true);
    expect(test.date(1714700000000)).toBe(true);
    expect(test.dateISO('2024-05-03')).toBe(true);
    expect(test.idCard('11010119900307881X')).toBe(true);
    expect(test.amount('1,234.50')).toBe(true);
    expect(test.chinese('中文')).toBe(true);
    expect(test.letter('Abc')).toBe(true);
    expect(test.enOrNum('Ab1')).toBe(true);
    expect(test.contains('hello', 'ell')).toBe(true);
    expect(test.range(5, [1, 10])).toBe(true);
    expect(test.rangeLength('abcd', [2, 6])).toBe(true);
    expect(test.landline('010-12345678')).toBe(true);
    expect(test.jsonString('{"a":1}')).toBe(true);
    expect(test.objectPromise(Promise.resolve())).toBe(true);
    expect(test.code('123456')).toBe(true);
    expect(test.code('123', 3)).toBe(true);
    expect(test.isEmpty('')).toBe(true);
    expect(test.isEmpty(0)).toBe(true);
  });

  it('carNo accepts plates', () => {
    expect(test.carNo('京A12345')).toBe(true);
  });
});

describe('P52 $u utility library (system)', () => {
  it('os/system/window info work in RN test env', async () => {
    expect(['ios', 'android', 'windows', 'macos', 'web'].includes(os())).toBe(true);
    expect(sys().platform).toBe(os());
    expect(getWindowInfo().screenWidth).toBeGreaterThan(0);
    await expect(sleep(1)).resolves.toBeUndefined();
  });

  it('genLightColor produces a light tint', () => {
    expect(genLightColor('#2979ff')).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('range matches source clamp behavior', () => {
    expect(range(0, 100, 150)).toBe(100);
    expect(range(0, 100, -5)).toBe(0);
    expect(range(0, 100, 42)).toBe(42);
  });
});
