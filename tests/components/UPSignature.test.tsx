import React, { createRef } from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UP,
  UPRoot,
  UPSignature,
  type UPCanvasAdapterComponent,
  type UPCanvasAdapterHandle,
  type UPCanvasDrawCommand,
  type UPSignatureRef,
} from '../../src';

function createMockAdapter(commands: UPCanvasDrawCommand[], exportPath = 'mock://signature.png') {
  const handle: UPCanvasAdapterHandle = {
    execute: jest.fn(async (command) => {
      commands.push(command);
    }),
    toTempFilePath: jest.fn(async () => ({
      height: 180,
      tempFilePath: exportPath,
      width: 300,
    })),
  };
  const MockAdapter: UPCanvasAdapterComponent = ({
    onReady,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    testID,
  }) => {
    React.useEffect(() => {
      onReady(handle);
    }, [onReady]);
    return (
      <View testID={testID} onTouchEnd={onTouchEnd} onTouchMove={onTouchMove} onTouchStart={onTouchStart}>
        <Text>signature canvas</Text>
      </View>
    );
  };
  return { MockAdapter, handle };
}

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function touch(x: number, y: number) {
  return { nativeEvent: { locationX: x, locationY: y, pageX: x, pageY: y } };
}

it('records touch paths and sends canvas draw commands', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const { MockAdapter } = createMockAdapter(commands);
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(<UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig' }} ref={ref} />);

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig')).toBeTruthy());
  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig'), 'touchStart', touch(10, 12));
    fireEvent(screen.getByTestId('up-canvas-sig'), 'touchMove', touch(20, 24));
    fireEvent(screen.getByTestId('up-canvas-sig'), 'touchEnd', touch(20, 24));
  });

  expect(ref.current?.getPaths()).toHaveLength(1);
  expect(commands).toEqual(expect.arrayContaining([
    { kind: 'set', property: 'strokeStyle', value: '#000000' },
    { kind: 'set', property: 'lineWidth', value: 3 },
    { args: [], kind: 'call', method: 'beginPath' },
    { args: [10, 12], kind: 'call', method: 'moveTo' },
    { args: [20, 24], kind: 'call', method: 'lineTo' },
    { args: [], kind: 'call', method: 'stroke' },
    { args: [], kind: 'call', method: 'draw' },
    { args: [], kind: 'call', method: 'closePath' },
  ]));
});

it('undo redraws the remaining paths and clear emits onClear', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onClear = jest.fn();
  const { MockAdapter } = createMockAdapter(commands);
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(
    <UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-undo' }} onClear={onClear} ref={ref} />,
  );

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig-undo')).toBeTruthy());
  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchStart', touch(1, 1));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchMove', touch(2, 2));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchEnd', touch(2, 2));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchStart', touch(3, 3));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchMove', touch(4, 4));
    fireEvent(screen.getByTestId('up-canvas-sig-undo'), 'touchEnd', touch(4, 4));
  });

  await act(async () => {
    ref.current?.undo();
  });
  expect(ref.current?.getPaths()).toHaveLength(1);
  expect(commands).toEqual(expect.arrayContaining([{ args: [0, 0, 300, 180], kind: 'call', method: 'clearRect' }]));

  await act(async () => {
    ref.current?.clear();
  });
  expect(ref.current?.isEmpty()).toBe(true);
  expect(onClear).toHaveBeenCalledTimes(1);
});

it('confirm exports non-empty signature and ignores empty signature', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onConfirm = jest.fn();
  const { MockAdapter } = createMockAdapter(commands, 'mock://done.png');
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(
    <UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-export' }} onConfirm={onConfirm} ref={ref} />,
  );

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig-export')).toBeTruthy());
  await act(async () => {
    await ref.current?.confirm();
  });
  expect(onConfirm).not.toHaveBeenCalled();

  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig-export'), 'touchStart', touch(5, 5));
    fireEvent(screen.getByTestId('up-canvas-sig-export'), 'touchMove', touch(9, 9));
    fireEvent(screen.getByTestId('up-canvas-sig-export'), 'touchEnd', touch(9, 9));
    await ref.current?.confirm();
  });
  expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ tempFilePath: 'mock://done.png' }));
});

it('forwards export errors through onError', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onError = jest.fn();
  const { MockAdapter, handle } = createMockAdapter(commands);
  handle.toTempFilePath = jest.fn(async () => {
    throw new Error('export failed');
  });
  const ref = createRef<UPSignatureRef>();
  const screen = renderRoot(
    <UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-error' }} onError={onError} ref={ref} />,
  );

  await waitFor(() => expect(screen.getByTestId('up-canvas-sig-error')).toBeTruthy());
  await act(async () => {
    fireEvent(screen.getByTestId('up-canvas-sig-error'), 'touchStart', touch(5, 5));
    fireEvent(screen.getByTestId('up-canvas-sig-error'), 'touchMove', touch(9, 9));
    fireEvent(screen.getByTestId('up-canvas-sig-error'), 'touchEnd', touch(9, 9));
    await ref.current?.confirm();
  });
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'export failed' }));
});

it('toolbar buttons clear, undo, change color, and change thickness', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const { MockAdapter } = createMockAdapter(commands);
  const screen = renderRoot(<UPSignature canvasProps={{ canvasAdapter: MockAdapter, canvasId: 'sig-toolbar' }} />);

  expect(screen.getByTestId('up-signature-toolbar')).toBeTruthy();
  await act(async () => {
    fireEvent.press(screen.getByTestId('up-signature-color-1'));
    fireEvent.press(screen.getByTestId('up-slider-value-4'));
    fireEvent.press(screen.getByTestId('up-signature-clear'));
    fireEvent.press(screen.getByTestId('up-signature-undo'));
  });
  expect(screen.getByTestId('up-signature')).toBeTruthy();
});

it('merges UP.setConfig defaults for signature', () => {
  act(() => {
    UP.setConfig({ props: { signature: { color: '#123456', thickness: 5 } } });
  });
  const screen = renderRoot(<UPSignature showToolbar={false} />);
  expect(screen.getByTestId('up-signature')).toBeTruthy();
  expect(screen.queryByTestId('up-signature-toolbar')).toBeNull();
});
