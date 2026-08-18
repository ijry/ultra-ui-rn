/**
 * Float-safe arithmetic, ported from uview-plus `libs/function/digit.js`
 * and `libs/function/calc.js`. All helpers avoid IEEE-754 rounding errors.
 */

/**
 * Strip the decimal-tail error of a float.
 * Mirrors `digit.strip`.
 */
export function strip(num: number, precision = 15): number {
  return +parseFloat(Number(num).toPrecision(precision));
}

/**
 * Count the digits after the decimal point.
 * Mirrors `digit.digitLength`.
 */
export function digitLength(num: number | string): number {
  const value = Number(num);
  const eSplit = value.toString().split(/[eE]/);
  const len = (eSplit[0].split('.')[1] || '').length - (+(eSplit[1] || 0));
  return len > 0 ? len : 0;
}

/**
 * Convert a float to a fixed integer for arithmetic.
 * Mirrors `digit.float2Fixed`.
 */
export function float2Fixed(num: number | string): number {
  const value = Number(num);
  if (value.toString().indexOf('e') === -1) {
    return Number(value.toString().replace('.', ''));
  }
  const dLen = digitLength(value);
  return dLen > 0 ? strip(Number(value) * Math.pow(10, dLen)) : Number(value);
}

/**
 * Check whether a number exceeds the safe integer boundary.
 * Mirrors `digit.checkBoundary`.
 */
export function checkBoundary(num: number): boolean {
  if (Number(num) > Number.MAX_SAFE_INTEGER || Number(num) < Number.MIN_SAFE_INTEGER) {
    console.warn(`${num} 超出安全数字边界，计算结果可能不正确`);
  }
  return true;
}

let boundaryCheckingEnabled = true;

/**
 * Enable/disable safe-integer boundary checking.
 * Mirrors `digit.enableBoundaryChecking`.
 */
export function enableBoundaryChecking(flag = true): void {
  boundaryCheckingEnabled = flag;
}

function iteratorOperation(arr: number[], operation: (a: number, b: number) => number): number {
  const [first = 0, ...others] = arr;
  let result = first;
  for (const num of others) result = operation(result, num);
  return result;
}

/**
 * Multiply any number of values exactly.
 * Mirrors `digit.times`.
 */
export function times(...nums: (number | string)[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return Number(nums[0]);
  const result = iteratorOperation(nums as number[], (a, b) => {
    const num1 = Number(a);
    const num2 = Number(b);
    const num1Changed = float2Fixed(num1);
    const num2Changed = float2Fixed(num2);
    const baseNum = digitLength(num1) + digitLength(num2);
    const leftValue = num1Changed * num2Changed;
    if (boundaryCheckingEnabled) checkBoundary(leftValue);
    return leftValue / Math.pow(10, baseNum);
  });
  return Number(result.toPrecision(12));
}

/**
 * Add any number of values exactly.
 * Mirrors `digit.plus`.
 */
export function plus(...nums: (number | string)[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return Number(nums[0]);
  const result = iteratorOperation(nums as number[], (a, b) => {
    const num1 = Number(a);
    const num2 = Number(b);
    const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
    return (times(num1, baseNum) + times(num2, baseNum)) / baseNum;
  });
  return Number(result.toPrecision(12));
}

/**
 * Subtract values exactly.
 * Mirrors `digit.minus`.
 */
export function minus(...nums: (number | string)[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return Number(nums[0]);
  const result = iteratorOperation(nums as number[], (a, b) => {
    const num1 = Number(a);
    const num2 = Number(b);
    const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
    return (times(num1, baseNum) - times(num2, baseNum)) / baseNum;
  });
  return Number(result.toPrecision(12));
}

/**
 * Divide values exactly.
 * Mirrors `digit.divide`.
 */
export function divide(...nums: (number | string)[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return Number(nums[0]);
  const result = iteratorOperation(nums as number[], (a, b) => {
    const num1 = Number(a);
    const num2 = Number(b);
    const num1Changed = float2Fixed(num1);
    const num2Changed = float2Fixed(num2);
    if (boundaryCheckingEnabled) checkBoundary(num1Changed);
    return times(num1Changed / num2Changed, Math.pow(10, digitLength(num2) - digitLength(num1)));
  });
  return Number(result.toPrecision(12));
}

/**
 * Round to a given number of decimal places.
 * Mirrors `digit.round`.
 */
export function round(num: number, ratio: number): number {
  const base = Math.pow(10, ratio);
  const value = divide(Math.round(Math.abs(times(num, base))), base);
  return num < 0 ? -value : value;
}

/**
 * Float-safe addition (calc.js).
 */
export function add(arg1: number | string, arg2: number | string): number {
  return plus(arg1, arg2);
}

/**
 * Float-safe subtraction (calc.js).
 */
export function sub(arg1: number | string, arg2: number | string): number {
  return minus(arg1, arg2);
}

/**
 * Float-safe multiplication (calc.js).
 */
export function mul(a: number | string, b: number | string): number {
  return times(a, b);
}

/**
 * Float-safe division (calc.js).
 */
export function div(a: number | string, b: number | string): number {
  return divide(a, b);
}
