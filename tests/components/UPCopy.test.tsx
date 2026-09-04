import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UP, UPCopy, UPRoot, type UPCopyWriteText } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders the source label, stringifies content, and emits success after copying', async () => {
  const writeText: UPCopyWriteText = jest.fn();
  const onSuccess = jest.fn();
  const screen = renderRoot(<UPCopy content={42} onSuccess={onSuccess} writeText={writeText} />);

  expect(screen.getByTestId('up-copy-default-label').props.children).toBe('复制');
  fireEvent.press(screen.getByTestId('up-copy'));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith('42'));
  expect(onSuccess).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(screen.getByText('复制成功')).toBeTruthy());
});

it('uses a source modal notice when alertStyle is modal', async () => {
  const screen = renderRoot(<UPCopy alertStyle="modal" content="invoice-7" writeText={jest.fn()} />);

  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByTestId('up-modal')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-modal-confirm'));
  expect(screen.queryByTestId('up-modal')).toBeNull();
});

it('does not invoke the adapter when source content is empty', async () => {
  const writeText = jest.fn();
  const screen = renderRoot(<UPCopy content="" writeText={writeText} />);

  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('暂无')).toBeTruthy());
  expect(writeText).not.toHaveBeenCalled();
});

it('reports adapter failures without emitting success and warns for a missing adapter', async () => {
  const throwingWriteText = jest.fn(() => {
    throw new Error('native clipboard unavailable');
  });
  const rejectingWriteText = jest.fn(() => Promise.reject(new Error('clipboard rejected')));
  const onSuccess = jest.fn();
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = renderRoot(<UPCopy content="first" onSuccess={onSuccess} writeText={throwingWriteText} />);

  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('复制失败')).toBeTruthy());
  expect(onSuccess).not.toHaveBeenCalled();

  screen.rerender(<UPRoot><UPCopy content="second" onSuccess={onSuccess} writeText={rejectingWriteText} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(rejectingWriteText).toHaveBeenCalledWith('second'));
  expect(onSuccess).not.toHaveBeenCalled();

  screen.rerender(<UPRoot><UPCopy content="third" onSuccess={onSuccess} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('复制失败')).toBeTruthy());
  expect(warning).toHaveBeenCalledWith(expect.stringContaining('writeText'));
  expect(onSuccess).not.toHaveBeenCalled();
  warning.mockRestore();
});

it('reacts to mounted global defaults while explicit props retain precedence', async () => {
  const writeText = jest.fn();
  const screen = renderRoot(<UPCopy content="receipt" writeText={writeText} />);

  act(() => {
    UP.setConfig({ props: { copy: { notice: 'Copied' } } });
  });
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('Copied')).toBeTruthy());

  screen.rerender(<UPRoot><UPCopy content="receipt" notice="Fixed message" writeText={writeText} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('Fixed message')).toBeTruthy());
});

it('copies when a nested pressable child captures the gesture', async () => {
  // Upstream nests an up-button inside up-copy and relies on tap bubbling
  // (copy.nvue:12-14). In RN the innermost pressable wins responder arbitration,
  // so the wrapper's onPress never ran and 点击按钮复制 was dead on device — the
  // toast and the OS clipboard chip both stayed away. The wrapper now also watches
  // raw touches, which reach an ancestor even when a descendant is the responder.
  const writeText = jest.fn();
  const screen = renderRoot(
    <UPCopy content="uview-plus is great !" writeText={writeText}>
      <Pressable testID="nested-button"><Text>点击复制</Text></Pressable>
    </UPCopy>,
  );

  const bubble = screen.getByTestId('up-copy-bubble');
  fireEvent(bubble, 'touchStart', { nativeEvent: { pageX: 100, pageY: 200 } });
  fireEvent(bubble, 'touchEnd', { nativeEvent: { pageX: 101, pageY: 202 } });

  await waitFor(() => expect(writeText).toHaveBeenCalledWith('uview-plus is great !'));
});

it('does not copy when the touch is a scroll rather than a tap', async () => {
  const writeText = jest.fn();
  const screen = renderRoot(
    <UPCopy content="uview-plus is great !" writeText={writeText}>
      <Pressable testID="nested-button"><Text>点击复制</Text></Pressable>
    </UPCopy>,
  );

  const bubble = screen.getByTestId('up-copy-bubble');
  fireEvent(bubble, 'touchStart', { nativeEvent: { pageX: 100, pageY: 200 } });
  fireEvent(bubble, 'touchEnd', { nativeEvent: { pageX: 104, pageY: 460 } });

  await waitFor(() => expect(screen.queryByText('复制成功')).toBeNull());
  expect(writeText).not.toHaveBeenCalled();
});

it('copies once, not twice, when the wrapper itself takes the press', async () => {
  const writeText = jest.fn();
  const screen = renderRoot(<UPCopy content="single" writeText={writeText} />);

  const bubble = screen.getByTestId('up-copy-bubble');
  fireEvent(bubble, 'touchStart', { nativeEvent: { pageX: 10, pageY: 10 } });
  fireEvent(screen.getByTestId('up-copy'), 'pressIn');
  fireEvent.press(screen.getByTestId('up-copy'));
  fireEvent(bubble, 'touchEnd', { nativeEvent: { pageX: 10, pageY: 11 } });

  await waitFor(() => expect(writeText).toHaveBeenCalledWith('single'));
  expect(writeText).toHaveBeenCalledTimes(1);
});
