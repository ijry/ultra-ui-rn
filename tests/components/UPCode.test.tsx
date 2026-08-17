import React, { createRef } from 'react';
import { act, render } from '@testing-library/react-native';
import {
  UP,
  UPCode,
  UPRoot,
  type UPCodeRef,
  type UPCodeStorage,
} from '../../src';
import { resetUPConfigForTests } from '../../src/config/store';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function storage(initial: Record<string, string | null> = {}): UPCodeStorage & {
  values: Record<string, string | null>;
} {
  const values = { ...initial };
  return {
    getItem: jest.fn((key: string) => values[key] ?? null),
    removeItem: jest.fn((key: string) => { delete values[key]; }),
    setItem: jest.fn((key: string, value: string) => { values[key] = value; }),
    values,
  };
}

afterEach(() => {
  jest.useRealTimers();
  resetUPConfigForTests();
});

it('is headless and emits source countdown text through an imperative ref', () => {
  jest.useFakeTimers();
  const ref = createRef<UPCodeRef>();
  const onChange = jest.fn();
  const onEnd = jest.fn();
  const onStart = jest.fn();
  const screen = render(
    <UPCode
      changeText="Retry X/x"
      endText="Retry now"
      onChange={onChange}
      onEnd={onEnd}
      onStart={onStart}
      ref={ref}
      seconds={3}
      startText="Send code"
    />,
  );

  expect(screen.toJSON()).toBeNull();
  expect(onChange).toHaveBeenLastCalledWith('Send code');
  act(() => ref.current?.start());
  expect(onStart).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenLastCalledWith('Retry 3/x');
  act(() => jest.advanceTimersByTime(1_000));
  expect(onChange).toHaveBeenLastCalledWith('Retry 2/x');
  act(() => jest.advanceTimersByTime(2_000));
  expect(onChange).toHaveBeenLastCalledWith('Retry now');
  expect(onEnd).toHaveBeenCalledTimes(1);
});

it('restarts active countdowns, resets without ending, and completes zero seconds on its next tick', () => {
  jest.useFakeTimers();
  const ref = createRef<UPCodeRef>();
  const onChange = jest.fn();
  const onEnd = jest.fn();
  const onStart = jest.fn();
  renderRoot(
    <UPCode
      changeText="X seconds"
      endText="Again"
      onChange={onChange}
      onEnd={onEnd}
      onStart={onStart}
      ref={ref}
      seconds={2}
    />,
  );

  act(() => ref.current?.start());
  act(() => jest.advanceTimersByTime(1_000));
  act(() => ref.current?.start());
  expect(onStart).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenLastCalledWith('2 seconds');
  act(() => ref.current?.reset());
  expect(onChange).toHaveBeenLastCalledWith('Again');
  expect(onEnd).not.toHaveBeenCalled();

  const zeroRef = createRef<UPCodeRef>();
  const zeroChange = jest.fn();
  const zeroEnd = jest.fn();
  renderRoot(<UPCode changeText="X second" onChange={zeroChange} onEnd={zeroEnd} ref={zeroRef} seconds={0} />);
  act(() => zeroRef.current?.start());
  expect(zeroChange).toHaveBeenLastCalledWith('0 second');
  expect(zeroEnd).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(1_000));
  expect(zeroEnd).toHaveBeenCalledTimes(1);
});

it('clears timers on unmount', () => {
  jest.useFakeTimers();
  const ref = createRef<UPCodeRef>();
  const onChange = jest.fn();
  const screen = renderRoot(<UPCode onChange={onChange} ref={ref} seconds={2} />);

  act(() => ref.current?.start());
  const callsBeforeUnmount = onChange.mock.calls.length;
  screen.unmount();
  act(() => jest.advanceTimersByTime(3_000));
  expect(onChange).toHaveBeenCalledTimes(callsBeforeUnmount);
});

it('persists active deadlines, restores them, and removes them on reset or completion', () => {
  jest.useFakeTimers();
  jest.setSystemTime(100_000);
  const adapter = storage();
  const ref = createRef<UPCodeRef>();
  const onChange = jest.fn();
  const onStart = jest.fn();
  const first = renderRoot(
    <UPCode
      changeText="Retry X"
      keepRunning
      onChange={onChange}
      onStart={onStart}
      ref={ref}
      seconds={3}
      storage={adapter}
      uniqueKey="signup"
    />,
  );

  act(() => ref.current?.start());
  expect(adapter.values.signup_$uCountDownTimestamp).toBe('103000');
  first.unmount();
  expect(adapter.values.signup_$uCountDownTimestamp).toBe('103000');

  const restoredChange = jest.fn();
  const restoredStart = jest.fn();
  const restoredEnd = jest.fn();
  const restored = renderRoot(
    <UPCode
      changeText="Retry X"
      keepRunning
      onChange={restoredChange}
      onEnd={restoredEnd}
      onStart={restoredStart}
      seconds={3}
      storage={adapter}
      uniqueKey="signup"
    />,
  );
  expect(restoredChange).toHaveBeenLastCalledWith('Retry 3');
  expect(restoredStart).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(3_000));
  expect(restoredEnd).toHaveBeenCalledTimes(1);
  expect(adapter.values.signup_$uCountDownTimestamp).toBeUndefined();

  const resetRef = createRef<UPCodeRef>();
  restored.rerender(
    <UPRoot>
      <UPCode keepRunning ref={resetRef} seconds={3} storage={adapter} uniqueKey="signup" />
    </UPRoot>,
  );
  act(() => resetRef.current?.start());
  expect(adapter.values.signup_$uCountDownTimestamp).toBe('106000');
  act(() => resetRef.current?.reset());
  expect(adapter.values.signup_$uCountDownTimestamp).toBeUndefined();
});

it('restores async storage and safely ignores storage adapter failures', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(100_000);
  const asyncStorage: UPCodeStorage = {
    getItem: jest.fn().mockResolvedValue('102000'),
    removeItem: jest.fn().mockResolvedValue(undefined),
    setItem: jest.fn().mockResolvedValue(undefined),
  };
  const restoredChange = jest.fn();
  renderRoot(
    <UPCode changeText="Wait X" keepRunning onChange={restoredChange} storage={asyncStorage} uniqueKey="async" />,
  );
  await act(async () => { await Promise.resolve(); });
  expect(restoredChange).toHaveBeenLastCalledWith('Wait 2');

  const failures: UPCodeStorage = {
    getItem: jest.fn().mockRejectedValue(new Error('read')),
    removeItem: jest.fn().mockRejectedValue(new Error('remove')),
    setItem: jest.fn().mockRejectedValue(new Error('write')),
  };
  const ref = createRef<UPCodeRef>();
  const onChange = jest.fn();
  const onEnd = jest.fn();
  renderRoot(
    <UPCode keepRunning onChange={onChange} onEnd={onEnd} ref={ref} seconds={1} storage={failures} uniqueKey="fail" />,
  );
  await act(async () => { await Promise.resolve(); });
  act(() => ref.current?.start());
  act(() => jest.advanceTimersByTime(1_000));
  expect(onChange).toHaveBeenCalled();
  expect(onEnd).toHaveBeenCalledTimes(1);
});

it('ignores delayed storage reads after unmount', async () => {
  let rejectRead: (reason?: unknown) => void = () => {};
  const delayedStorage: UPCodeStorage = {
    getItem: jest.fn(() => new Promise<string | null>((_resolve, reject) => { rejectRead = reject; })),
    removeItem: jest.fn(),
    setItem: jest.fn(),
  };
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPCode keepRunning onChange={onChange} storage={delayedStorage} uniqueKey="delayed" />,
  );

  screen.unmount();
  await act(async () => {
    rejectRead(new Error('late read'));
    await Promise.resolve();
  });
  expect(onChange).not.toHaveBeenCalled();
});

it('uses reactive code defaults while explicit props win', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  const screen = renderRoot(<UPCode onChange={onChange} />);

  act(() => {
    UP.setConfig({ props: { code: { changeText: 'Configured X', seconds: 2 } } });
  });
  const ref = createRef<UPCodeRef>();
  screen.rerender(<UPRoot><UPCode onChange={onChange} ref={ref} seconds={4} /></UPRoot>);
  act(() => ref.current?.start());
  expect(onChange).toHaveBeenLastCalledWith('Configured 4');
});
