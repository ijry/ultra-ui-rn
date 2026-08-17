import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPCountToRef = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

export type UPCountToProps = {
  startVal?: number | string;
  endVal?: number | string;
  duration?: UPDimension;
  autoplay?: boolean;
  decimals?: number | string;
  useEasing?: boolean;
  decimal?: string;
  color?: string;
  fontSize?: UPDimension;
  bold?: boolean;
  separator?: string;
  customStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onEnd?: () => void;
};

function number(value: number | string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function format(value: number, decimals: number, decimal: string, separator: string): string {
  const [integer, fraction] = value.toFixed(Math.max(0, decimals)).split('.');
  const separated = separator ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : integer;
  return fraction === undefined ? separated : `${separated}${decimal}${fraction}`;
}

function eased(progress: number): number {
  return (1 - Math.pow(2, -10 * progress)) * 1024 / 1023;
}

export const UPCountTo = forwardRef<UPCountToRef, UPCountToProps>(function UPCountTo(input, ref) {
  const props = { ...useUPConfig().props.countTo, ...input } as UPCountToProps;
  const [value, setValue] = useState(() => number(props.startVal));
  const valueRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);
  const startTimeRef = useRef(0);
  const baseRef = useRef(number(props.startVal));
  const durationRef = useRef(getPx(props.duration ?? 2000));
  const propsRef = useRef(props);
  propsRef.current = props;
  const inputRef = useRef(input);
  inputRef.current = input;

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const setCurrent = useCallback((next: number) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  const schedule = useCallback(function scheduleTick() {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (!runningRef.current) return;
      const current = propsRef.current;
      const target = number(current.endVal);
      const elapsed = Date.now() - startTimeRef.current;
      const progress = durationRef.current <= 0 ? 1 : Math.min(1, elapsed / durationRef.current);
      const ratio = current.useEasing ? eased(progress) : progress;
      setCurrent(baseRef.current + (target - baseRef.current) * ratio);
      if (progress >= 1) {
        runningRef.current = false;
        clearTimer();
        inputRef.current.onEnd?.();
      } else {
        scheduleTick();
      }
    }, 16);
  }, [clearTimer, setCurrent]);

  const startFrom = useCallback((base: number, duration: number) => {
    clearTimer();
    baseRef.current = base;
    durationRef.current = Math.max(0, duration);
    startTimeRef.current = Date.now();
    runningRef.current = true;
    if (durationRef.current === 0) {
      setCurrent(number(propsRef.current.endVal));
      runningRef.current = false;
      inputRef.current.onEnd?.();
      return;
    }
    schedule();
  }, [clearTimer, schedule, setCurrent]);

  const start = useCallback(() => {
    startFrom(number(propsRef.current.startVal), getPx(propsRef.current.duration ?? 2000));
  }, [startFrom]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    const elapsed = Date.now() - startTimeRef.current;
    durationRef.current = Math.max(0, durationRef.current - elapsed);
    runningRef.current = false;
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (runningRef.current || valueRef.current === number(propsRef.current.endVal)) return;
    startFrom(valueRef.current, durationRef.current);
  }, [startFrom]);

  const reset = useCallback(() => {
    clearTimer();
    runningRef.current = false;
    durationRef.current = getPx(propsRef.current.duration ?? 2000);
    setCurrent(number(propsRef.current.startVal));
  }, [clearTimer, setCurrent]);

  useImperativeHandle(ref, () => ({ pause, reset, resume, start }), [pause, reset, resume, start]);

  useEffect(() => {
    reset();
    if (props.autoplay) start();
    return clearTimer;
  }, [clearTimer, props.autoplay, props.endVal, props.startVal, reset, start]);

  const decimals = Math.max(0, Math.floor(number(props.decimals)));
  return <Text style={[{ color: props.color, fontSize: getPx(props.fontSize ?? 22), fontWeight: props.bold ? '700' : '400' }, input.customStyle]} testID="up-count-to">{format(value, decimals, props.decimal ?? '.', props.separator ?? '')}</Text>;
});
