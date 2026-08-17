import React, { createRef } from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UP,
  UPCanvas,
  UPRoot,
  type UPCanvasAdapterComponent,
  type UPCanvasAdapterHandle,
  type UPCanvasDrawCommand,
  type UPCanvasRef,
} from '../../src';

function createMockAdapter(commands: UPCanvasDrawCommand[], ready: UPCanvasAdapterHandle) {
  const MockAdapter: UPCanvasAdapterComponent = ({ onReady, onTouchStart, onTouchMove, onTouchEnd, testID }) => {
    React.useEffect(() => {
      onReady({
        ...ready,
        execute: async (command) => {
          commands.push(command);
          return ready.execute(command);
        },
      });
    }, [onReady]);

    return (
      <View
        testID={testID}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
      >
        <Text>mock canvas</Text>
      </View>
    );
  };

  return MockAdapter;
}

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders injected adapter and calls onReady once', async () => {
  const onReady = jest.fn();
  const commands: UPCanvasDrawCommand[] = [];
  const handle: UPCanvasAdapterHandle = {
    execute: jest.fn(async () => undefined),
    getCanvasElement: jest.fn(async () => ({ id: 'canvas-a' })),
    getRawContext: jest.fn(async () => ({ kind: '2d' })),
  };

  const screen = renderRoot(
    <UPCanvas canvasAdapter={createMockAdapter(commands, handle)} canvasId="canvas-a" onReady={onReady} />,
  );

  await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('up-canvas-canvas-a')).toBeTruthy();
});

it('renders the bundled adapter with default dimensions', async () => {
  const onReady = jest.fn();
  const screen = renderRoot(<UPCanvas canvasId="bundled" onReady={onReady} />);

  await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('up-canvas-bundled')).toBeTruthy();
});

it('queues drawing commands in call order before adapter readiness', async () => {
  const ref = createRef<UPCanvasRef>();
  const commands: UPCanvasDrawCommand[] = [];
  let releaseReady: () => void = () => undefined;
  const readyPromise = new Promise<void>((resolve) => {
    releaseReady = resolve;
  });
  const SlowAdapter: UPCanvasAdapterComponent = ({ onReady, testID }) => {
    React.useEffect(() => {
      void readyPromise.then(() => {
        onReady({
          execute: async (command) => {
            commands.push(command);
          },
        });
      });
    }, [onReady]);
    return <View testID={testID} />;
  };

  renderRoot(<UPCanvas canvasAdapter={SlowAdapter} canvasId="queue" ref={ref} />);

  const fill = ref.current?.setFillStyle('#111');
  const rect = ref.current?.fillRect(1, 2, 3, 4);
  const draw = ref.current?.draw();

  await act(async () => {
    releaseReady();
    await Promise.all([fill, rect, draw]);
  });

  expect(commands).toEqual([
    { kind: 'set', property: 'fillStyle', value: '#111' },
    { args: [1, 2, 3, 4], kind: 'call', method: 'fillRect' },
    { args: [], kind: 'call', method: 'draw' },
  ]);
});

it('forwards touch events and reports adapter errors', async () => {
  const onError = jest.fn();
  const onTouchStart = jest.fn();
  const commands: UPCanvasDrawCommand[] = [];
  const handle: UPCanvasAdapterHandle = {
    execute: jest.fn(async () => {
      throw new Error('draw failed');
    }),
  };
  const ref = createRef<UPCanvasRef>();
  const screen = renderRoot(
    <UPCanvas
      canvasAdapter={createMockAdapter(commands, handle)}
      canvasId="events"
      onError={onError}
      onTouchStart={onTouchStart}
      ref={ref}
    />,
  );

  fireEvent(screen.getByTestId('up-canvas-events'), 'touchStart', { nativeEvent: { pageX: 1 } });
  await act(async () => {
    await expect(ref.current?.fillRect(0, 0, 1, 1)).rejects.toThrow('draw failed');
  });

  expect(onTouchStart).toHaveBeenCalledTimes(1);
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'draw failed' }));
});

it('uses configured adapter unless an explicit prop overrides it', async () => {
  const configuredCommands: UPCanvasDrawCommand[] = [];
  const explicitCommands: UPCanvasDrawCommand[] = [];
  const handle: UPCanvasAdapterHandle = { execute: jest.fn(async () => undefined) };
  const ConfiguredAdapter = createMockAdapter(configuredCommands, handle);
  const ExplicitAdapter = createMockAdapter(explicitCommands, handle);

  UP.setConfig({ props: { canvas: { canvasAdapter: ConfiguredAdapter } } });

  const screen = renderRoot(<UPCanvas canvasAdapter={ExplicitAdapter} canvasId="configured" />);
  expect(screen.getByTestId('up-canvas-configured')).toBeTruthy();
  expect(configuredCommands).toEqual([]);
});

it('uses measured root dimensions when useRootHeightAndWidth is enabled', async () => {
  const ref = createRef<UPCanvasRef>();
  const sizes: Array<{ height: number; width: number }> = [];
  const MeasuringAdapter: UPCanvasAdapterComponent = ({ height, onReady, testID, width }) => {
    sizes.push({ height, width });
    React.useEffect(() => {
      onReady({ execute: jest.fn(async () => undefined) });
    }, [onReady]);
    return <View testID={testID} />;
  };

  const screen = renderRoot(
    <UPCanvas
      canvasAdapter={MeasuringAdapter}
      canvasId="measured"
      customStyle={{ height: 90, width: 180 }}
      ref={ref}
      useRootHeightAndWidth
    />,
  );

  fireEvent(screen.getByTestId('up-canvas'), 'layout', {
    nativeEvent: { layout: { height: 90, width: 180, x: 0, y: 0 } },
  });

  await waitFor(() => {
    expect(sizes[sizes.length - 1]).toEqual({ height: 90, width: 180 });
    expect(ref.current?.getHeight()).toBe(90);
    expect(ref.current?.getWidth()).toBe(180);
  });
});

it('clears pixels and repaints a non-transparent background', async () => {
  const ref = createRef<UPCanvasRef>();
  const commands: UPCanvasDrawCommand[] = [];
  const handle: UPCanvasAdapterHandle = { execute: jest.fn(async () => undefined) };

  renderRoot(
    <UPCanvas
      bgColor="#f5f7fa"
      canvasAdapter={createMockAdapter(commands, handle)}
      canvasId="clear"
      height={40}
      ref={ref}
      width={80}
    />,
  );

  await waitFor(() => expect(ref.current).not.toBeNull());
  await act(async () => {
    await ref.current?.clearCanvas();
  });

  expect(commands.slice(-3)).toEqual([
    { args: [0, 0, 80, 40], kind: 'call', method: 'clearRect' },
    { kind: 'set', property: 'fillStyle', value: '#f5f7fa' },
    { args: [0, 0, 80, 40], kind: 'call', method: 'fillRect' },
  ]);
});

it('rejects queued and later commands after unmount without executing them', async () => {
  const ref = createRef<UPCanvasRef>();
  const commands: UPCanvasDrawCommand[] = [];
  const NeverReadyAdapter: UPCanvasAdapterComponent = ({ testID }) => <View testID={testID} />;
  const screen = renderRoot(
    <UPCanvas canvasAdapter={NeverReadyAdapter} canvasId="unmount" ref={ref} />,
  );
  const api = ref.current as UPCanvasRef;
  const queued = api.fillRect(0, 0, 1, 1);

  screen.unmount();

  await expect(queued).rejects.toThrow('Canvas has been unmounted');
  await expect(api.fillRect(1, 1, 1, 1)).rejects.toThrow('Canvas has been unmounted');
  expect(commands).toEqual([]);
});
