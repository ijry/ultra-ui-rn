import React from 'react';
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
