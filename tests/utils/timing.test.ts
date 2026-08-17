import { debounce, throttle } from '../../src/utils/timing';

describe('timing utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces independently created functions', () => {
    const first = jest.fn();
    const second = jest.fn();
    const debounceFirst = debounce(first, 100);
    const debounceSecond = debounce(second, 100);

    debounceFirst();
    debounceFirst();
    debounceSecond();
    jest.advanceTimersByTime(100);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('throttles a button callback at the leading edge', () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 100);

    throttled();
    throttled();
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    throttled();
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
