import React from 'react';
import { View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UPQrcode,
  UPRoot,
  encodeQrMatrix,
  type UPCanvasAdapterComponent,
  type UPCanvasDrawCommand,
} from '../../src';

function createRecordingAdapter(commands: UPCanvasDrawCommand[], exportable = false): UPCanvasAdapterComponent {
  return ({ onReady, testID }) => {
    React.useEffect(() => {
      onReady({
        execute: async (command) => {
          commands.push(command);
        },
        toTempFilePath: exportable
          ? async () => ({ height: 120, tempFilePath: 'data:image/png;base64,qr', width: 120 })
          : undefined,
      });
    }, [onReady]);
    return <View testID={testID} />;
  };
}

function createDelayedAdapter(
  commands: UPCanvasDrawCommand[],
  gate: Promise<void>,
): UPCanvasAdapterComponent {
  return ({ onReady, testID }) => {
    React.useEffect(() => {
      onReady({
        execute: async (command) => {
          commands.push(command);
          await gate;
        },
      });
    }, [onReady]);
    return <View testID={testID} />;
  };
}

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('generates a deterministic QR matrix for short text', () => {
  const matrix = encodeQrMatrix('ultra', { correctLevel: 3 });

  expect(matrix.size).toBe(21);
  expect(matrix.modules).toHaveLength(21);
  expect(matrix.modules[0]).toHaveLength(21);
  expect(matrix.modules[0].slice(0, 7)).toEqual([true, true, true, true, true, true, true]);
});

it('draws background and dark modules when loadMake is true', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onResult = jest.fn();

  renderRoot(
    <UPQrcode
      canvasAdapter={createRecordingAdapter(commands)}
      canvasId="qr-a"
      onResult={onResult}
      size={120}
      val="ultra"
    />,
  );

  await waitFor(() => expect(onResult).toHaveBeenCalledTimes(1));
  expect(commands[0]).toEqual({ kind: 'set', property: 'fillStyle', value: '#ffffff' });
  expect(commands).toContainEqual({ args: [0, 0, 120, 120], kind: 'call', method: 'fillRect' });
  expect(commands.some((command) => command.kind === 'call' && command.method === 'fillRect')).toBe(true);
});

it('regenerates when val changes and onval is true', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const screen = renderRoot(
    <UPQrcode canvasAdapter={createRecordingAdapter(commands)} canvasId="qr-change" val="one" />,
  );

  await waitFor(() => expect(commands.length).toBeGreaterThan(5));
  const firstCount = commands.length;

  screen.rerender(
    <UPRoot>
      <UPQrcode canvasAdapter={createRecordingAdapter(commands)} canvasId="qr-change" val="two" />
    </UPRoot>,
  );

  await waitFor(() => expect(commands.length).toBeGreaterThan(firstCount + 5));
});

it('draws center icon when icon is provided', async () => {
  const commands: UPCanvasDrawCommand[] = [];

  renderRoot(
    <UPQrcode
      canvasAdapter={createRecordingAdapter(commands)}
      canvasId="qr-icon"
      icon="https://example.test/logo.png"
      iconSize={24}
      size={120}
      val="icon"
    />,
  );

  await waitFor(() => {
    expect(commands).toContainEqual({
      args: ['https://example.test/logo.png', 48, 48, 24, 24],
      kind: 'call',
      method: 'drawImage',
    });
  });
});

it('uses pdground for the three finder-pattern cores', async () => {
  const commands: UPCanvasDrawCommand[] = [];

  renderRoot(
    <UPQrcode
      canvasAdapter={createRecordingAdapter(commands)}
      canvasId="qr-pdground"
      pdground="#ff0000"
      size={210}
      val="ultra"
    />,
  );

  await waitFor(() => {
    const colorIndex = commands.findIndex(
      (command) =>
        command.kind === 'set' &&
        command.property === 'fillStyle' &&
        command.value === '#ff0000',
    );
    expect(colorIndex).toBeGreaterThan(-1);
    expect(commands[colorIndex + 1]).toEqual({
      args: [20, 20, 10, 10],
      kind: 'call',
      method: 'fillRect',
    });
  });
});

it('shows and clears the loading overlay around asynchronous drawing', async () => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const commands: UPCanvasDrawCommand[] = [];
  const screen = renderRoot(
    <UPQrcode
      canvasAdapter={createDelayedAdapter(commands, gate)}
      loadingText="正在生成"
      showLoading
      val="loading"
    />,
  );

  await waitFor(() => expect(screen.getByTestId('up-qrcode-loading')).toBeTruthy());
  expect(screen.getByText('正在生成')).toBeTruthy();

  await act(async () => {
    release();
    await gate;
  });
  await waitFor(() => expect(screen.queryByTestId('up-qrcode-loading')).toBeNull());
});

it('does not generate until makeCode when loadMake is false', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const ref = React.createRef<import('../../src').UPQrcodeRef>();

  renderRoot(
    <UPQrcode
      canvasAdapter={createRecordingAdapter(commands)}
      loadMake={false}
      ref={ref}
      val="manual"
    />,
  );

  await waitFor(() => expect(ref.current).not.toBeNull());
  expect(commands).toEqual([]);
  await act(async () => {
    await ref.current?.makeCode();
  });
  expect(commands.length).toBeGreaterThan(5);
});

it('exports for allowed preview and long press compatibility hooks', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onLongpressCallback = jest.fn();
  const onPreview = jest.fn();
  const onResult = jest.fn();
  const screen = renderRoot(
    <UPQrcode
      allowPreview
      canvasAdapter={createRecordingAdapter(commands, true)}
      onLongpressCallback={onLongpressCallback}
      onPreview={onPreview}
      onResult={onResult}
      val="preview"
    />,
  );

  await waitFor(() => expect(onResult).toHaveBeenCalledTimes(1));
  fireEvent.press(screen.getByTestId('up-qrcode-content'));
  await waitFor(() =>
    expect(onPreview).toHaveBeenCalledWith(
      expect.objectContaining({ tempFilePath: 'data:image/png;base64,qr' }),
    ),
  );

  fireEvent(screen.getByTestId('up-qrcode-content'), 'longPress');
  await waitFor(() =>
    expect(onLongpressCallback).toHaveBeenCalledWith('data:image/png;base64,qr'),
  );
});

it('reports empty value and unsupported export errors', async () => {
  const onError = jest.fn();
  const commands: UPCanvasDrawCommand[] = [];
  const ref = React.createRef<import('../../src').UPQrcodeRef>();

  renderRoot(
    <UPQrcode
      canvasAdapter={createRecordingAdapter(commands)}
      onError={onError}
      ref={ref}
      val=""
    />,
  );

  await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'QR value cannot be empty' })));

  await act(async () => {
    await expect(ref.current?.toTempFilePath()).rejects.toThrow('Canvas export is not supported');
  });
});
