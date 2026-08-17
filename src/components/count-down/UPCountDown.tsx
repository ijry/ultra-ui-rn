import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { type UPDimension } from '../../utils';
import { formatTime, parseTimeData, type UPTimeData } from './time';

export type UPCountDownRef = {
  start: () => void;
  pause: () => void;
  reset: () => void;
};

export type UPCountDownProps = {
  time?: UPDimension;
  format?: string;
  autoStart?: boolean;
  millisecond?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode | ((timeData: UPTimeData) => React.ReactNode);
  onChange?: (timeData: UPTimeData) => void;
  onFinish?: () => void;
};

function numeric(value: UPDimension | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export const UPCountDown = forwardRef<UPCountDownRef, UPCountDownProps>(function UPCountDown(input, ref) {
  const props = { ...useUPConfig().props.countDown, ...input } as UPCountDownProps;
  const [remain, setRemain] = useState(() => numeric(props.time));
  const remainRef = useRef(remain);
  const runningRef = useRef(false);
  const endTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const inputRef = useRef(input);
  inputRef.current = input;

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const publish = useCallback((next: number) => {
    const safe = Math.max(0, next);
    remainRef.current = safe;
    setRemain(safe);
    const timeData = parseTimeData(safe);
    inputRef.current.onChange?.(timeData);
    if (safe <= 0 && runningRef.current) {
      runningRef.current = false;
      clearTimer();
      inputRef.current.onFinish?.();
    }
  }, [clearTimer]);

  const schedule = useCallback(function scheduleTick() {
    clearTimer();
    const current = propsRef.current;
    timerRef.current = setTimeout(() => {
      if (!runningRef.current) return;
      publish(Math.max(endTimeRef.current - Date.now(), 0));
      if (runningRef.current && remainRef.current > 0) scheduleTick();
    }, current.millisecond ? 50 : 30);
  }, [clearTimer, publish]);

  const pause = useCallback(() => {
    runningRef.current = false;
    clearTimer();
  }, [clearTimer]);

  const start = useCallback(() => {
    if (runningRef.current || remainRef.current <= 0) return;
    runningRef.current = true;
    endTimeRef.current = Date.now() + remainRef.current;
    schedule();
  }, [schedule]);

  const reset = useCallback(() => {
    pause();
    publish(numeric(propsRef.current.time));
    if (propsRef.current.autoStart) start();
  }, [pause, publish, start]);

  useImperativeHandle(ref, () => ({ pause, reset, start }), [pause, reset, start]);

  useEffect(() => {
    reset();
    return clearTimer;
  }, [clearTimer, props.time, props.autoStart, props.millisecond, reset]);

  const timeData = parseTimeData(remain);
  const content = typeof input.children === 'function'
    ? input.children(timeData)
    : input.children ?? <Text style={[{ color: '#606266', fontSize: 15, lineHeight: 22 }, input.textStyle]}>{formatTime(props.format ?? 'HH:mm:ss', timeData)}</Text>;
  return <View style={input.customStyle} testID="up-count-down">{content}</View>;
});
