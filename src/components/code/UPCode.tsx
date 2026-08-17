import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useUPConfig } from '../../config/useUPConfig';

export type UPCodeStorage = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

export type UPCodeRef = {
  start: () => void;
  reset: () => void;
};

export type UPCodeProps = {
  seconds?: string | number;
  startText?: string;
  changeText?: string;
  endText?: string;
  keepRunning?: boolean;
  uniqueKey?: string;
  storage?: UPCodeStorage;
  onStart?: () => void;
  onChange?: (text: string) => void;
  onEnd?: () => void;
};

type StorageEntry = {
  key: string;
  storage: UPCodeStorage;
};

type StorageTask = {
  run: () => void | Promise<void>;
  version: number;
};

function wholeSeconds(value: string | number | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function textFor(changeText: string, seconds: number): string {
  return changeText.replace(/[xX]/, String(seconds));
}

function storageEntry(props: UPCodeProps): StorageEntry | null {
  if (!props.keepRunning || !props.storage || !props.uniqueKey) return null;
  return { key: `${props.uniqueKey}_$uCountDownTimestamp`, storage: props.storage };
}

function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
  return Boolean(value) && typeof (value as Promise<T>).then === 'function';
}

export const UPCode = forwardRef<UPCodeRef, UPCodeProps>(function UPCode(input, ref) {
  const props = { ...useUPConfig().props.code, ...input } as UPCodeProps;
  const propsRef = useRef(props);
  const runningRef = useRef(false);
  const deadlineRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runVersionRef = useRef(0);
  const storageBusyRef = useRef(false);
  const storageTasksRef = useRef<StorageTask[]>([]);
  const drainStorageTasksRef = useRef<() => void>(() => {});
  propsRef.current = props;

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const emit = useCallback((text: string) => {
    propsRef.current.onChange?.(text);
  }, []);

  drainStorageTasksRef.current = () => {
    if (storageBusyRef.current) return;
    while (storageTasksRef.current.length) {
      const task = storageTasksRef.current.shift();
      if (!task || task.version !== runVersionRef.current) continue;
      try {
        const result = task.run();
        if (isPromiseLike(result)) {
          storageBusyRef.current = true;
          void Promise.resolve(result).then(
            () => {
              storageBusyRef.current = false;
              drainStorageTasksRef.current();
            },
            () => {
              storageBusyRef.current = false;
              drainStorageTasksRef.current();
            },
          );
          return;
        }
      } catch {
      }
    }
  };

  const enqueueStorage = useCallback((task: StorageTask) => {
    storageTasksRef.current.push(task);
    drainStorageTasksRef.current();
  }, []);

  const removeDeadline = useCallback((entry: StorageEntry | null, version: number) => {
    if (!entry) return;
    enqueueStorage({ run: () => entry.storage.removeItem(entry.key), version });
  }, [enqueueStorage]);

  const saveDeadline = useCallback((entry: StorageEntry | null, deadlineMs: number, version: number) => {
    if (!entry) return;
    enqueueStorage({ run: () => entry.storage.setItem(entry.key, String(deadlineMs)), version });
  }, [enqueueStorage]);

  const finish = useCallback(() => {
    if (!runningRef.current) return;
    const version = runVersionRef.current;
    const entry = storageEntry(propsRef.current);
    runningRef.current = false;
    deadlineRef.current = 0;
    clearTimer();
    removeDeadline(entry, version);
    emit(propsRef.current.endText ?? '重新获取');
    propsRef.current.onEnd?.();
  }, [clearTimer, emit, removeDeadline]);

  const tickRef = useRef<() => void>(() => {});
  tickRef.current = () => {
    if (!runningRef.current) return;
    const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1_000));
    if (remaining <= 0) finish();
    else emit(textFor(propsRef.current.changeText ?? 'X秒重新获取', remaining));
  };

  const begin = useCallback((deadlineMs: number, emitStart: boolean, persist: boolean, version: number) => {
    clearTimer();
    runningRef.current = true;
    deadlineRef.current = deadlineMs;
    const remaining = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1_000));
    if (emitStart) propsRef.current.onStart?.();
    emit(textFor(propsRef.current.changeText ?? 'X秒重新获取', remaining));
    if (persist) saveDeadline(storageEntry(propsRef.current), deadlineMs, version);
    timerRef.current = setInterval(() => tickRef.current(), 1_000);
  }, [clearTimer, emit, saveDeadline]);

  const start = useCallback(() => {
    const version = runVersionRef.current + 1;
    runVersionRef.current = version;
    begin(Date.now() + wholeSeconds(propsRef.current.seconds) * 1_000, true, true, version);
  }, [begin]);

  const reset = useCallback(() => {
    const version = runVersionRef.current + 1;
    runVersionRef.current = version;
    const entry = storageEntry(propsRef.current);
    runningRef.current = false;
    deadlineRef.current = 0;
    clearTimer();
    removeDeadline(entry, version);
    emit(propsRef.current.endText ?? '重新获取');
  }, [clearTimer, emit, removeDeadline]);

  useImperativeHandle(ref, () => ({ reset, start }), [reset, start]);

  useEffect(() => {
    let alive = true;
    const version = runVersionRef.current + 1;
    runVersionRef.current = version;
    const current = propsRef.current;
    const entry = storageEntry(current);
    const emitInitial = () => emit(propsRef.current.startText ?? '获取验证码');
    const restore = (value: string | null) => {
      if (!alive || version !== runVersionRef.current) return;
      const deadlineMs = Number(value);
      if (Number.isFinite(deadlineMs) && deadlineMs > Date.now()) {
        begin(deadlineMs, false, false, version);
      } else {
        removeDeadline(entry, version);
        emitInitial();
      }
    };

    if (!entry) {
      emitInitial();
    } else {
      try {
        const value = entry.storage.getItem(entry.key);
        if (isPromiseLike(value)) {
          void Promise.resolve(value).then(
            (resolved) => restore(resolved),
            () => {
              if (alive && version === runVersionRef.current) emitInitial();
            },
          );
        } else {
          restore(value);
        }
      } catch {
        emitInitial();
      }
    }

    return () => {
      alive = false;
      clearTimer();
    };
  }, [begin, clearTimer, emit, removeDeadline]);

  return null;
});
