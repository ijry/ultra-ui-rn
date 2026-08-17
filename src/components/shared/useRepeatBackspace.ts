import { useCallback, useEffect, useRef } from 'react';

export function useRepeatBackspace(onBackspace: (() => void) | undefined) {
  const callbackRef = useRef(onBackspace);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  callbackRef.current = onBackspace;

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    callbackRef.current?.();
    stop();
    timerRef.current = setInterval(() => callbackRef.current?.(), 250);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { start, stop };
}
