# Ultra UI React Native P29 Canvas Code Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `UPCanvas`, `UPQrcode`, and `UPBarcode` with canvas-backed rendering and uview-plus-oriented APIs.

**Architecture:** `UPCanvas` owns the public drawing API, lifecycle, touch forwarding, and an ordered command queue. The built-in adapter uses `react-native-canvas`, while QR and barcode components generate pure data first and then draw through `UPCanvas`; tests use a mock adapter instead of a real WebView.

**Tech Stack:** React Native, TypeScript, `react-native-canvas@^0.1.40`, `react-native-webview@^14.0.1`, Jest, `@testing-library/react-native`, existing `getPx` sizing utility.

## Global Constraints

- Work directly in the existing `main` checkout; do not create a branch or worktree.
- Do not run `git add`, `git commit`, `git push`, `git reset`, or `git clean`.
- Modify files with `apply_patch`; dependency lockfile updates may be produced by `npm install`.
- Add `react-native-canvas` to `dependencies` for default rendering.
- Add `react-native-webview` to `dependencies` because `react-native-canvas@0.1.40` declares it as a peer dependency.
- Keep `react-native-canvas` internals behind the `UPCanvas` adapter contract.
- Do not add a React Native `View` grid fallback for QR or barcode rendering.
- Document that the default renderer is WebView-backed and is not a high-frequency animation guarantee.
- Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check` before handoff.

---

## File Structure

- Create `src/types/react-native-canvas.d.ts`: local module declaration for `react-native-canvas`.
- Create `src/components/canvas/types.ts`: canvas props, ref, command, adapter, and export result types.
- Create `src/components/canvas/defaultAdapter.tsx`: built-in `react-native-canvas` adapter component.
- Create `src/components/canvas/UPCanvas.tsx`: public canvas component and command queue.
- Create `src/components/canvas/index.ts`: public canvas exports.
- Create `src/components/qrcode/qrEncoder.ts`: pure QR matrix generation adapted from upstream `u-qrcode/qrcode.js`.
- Create `src/components/qrcode/UPQrcode.tsx`: QR component that draws matrix data through `UPCanvas`.
- Create `src/components/qrcode/index.ts`: public QR exports.
- Create `src/components/barcode/barcodeEncoder.ts`: pure barcode encoding for source-listed formats.
- Create `src/components/barcode/UPBarcode.tsx`: barcode component that draws encoded bars through `UPCanvas`.
- Create `src/components/barcode/index.ts`: public barcode exports.
- Modify `package.json`: add runtime canvas dependencies.
- Modify `package-lock.json`: lock runtime canvas dependencies.
- Modify `src/config/defaults.ts`: add `canvas`, `qrcode`, and `barcode` default props.
- Modify `src/config/store.ts`: add config override and merge support for new defaults.
- Modify `src/components/index.ts`: export canvas, QR, and barcode components.
- Modify `tests/setup.ts`: mock `react-native-canvas` and `react-native-webview` for Jest.
- Create `tests/components/UPCanvas.test.tsx`: lifecycle, adapter, queue, and error tests.
- Create `tests/components/UPQrcode.test.tsx`: generation, redraw, icon, export, and error tests.
- Create `tests/components/UPBarcode.test.tsx`: format, sizing, text, export mode, and error tests.
- Modify `example/App.tsx`: add compact examples for the three components.
- Modify `docs/compatibility.md`: document P29 component coverage and limits.
- Modify `docs/gap-matrix.md`: move canvas, QR, and barcode out of the gap list.

---

### Task 1: Dependencies And Test Harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/types/react-native-canvas.d.ts`
- Modify: `tests/setup.ts`

**Interfaces:**
- Produces: `Canvas` default import from module `react-native-canvas`, typed locally as a React component exposing `getContext('2d')`.
- Produces: Jest mocks that let `UPCanvas` import the default adapter without creating a real WebView.

- [ ] **Step 1: Verify dependency metadata**

Run:

```powershell
npm view react-native-canvas version peerDependencies dependencies --json
npm view react-native-webview version peerDependencies --json
```

Expected relevant facts:

```json
{
  "react-native-canvas": {
    "version": "0.1.40",
    "peerDependencies": {
      "react-native-webview": ">=5.10.0 || >=6.1.0"
    },
    "dependencies": {
      "ctx-polyfill": "^1.1.4"
    }
  },
  "react-native-webview": {
    "version": "14.0.1",
    "peerDependencies": {
      "react": "*",
      "react-native": "*"
    }
  }
}
```

- [ ] **Step 2: Install runtime dependencies**

Run:

```powershell
npm install react-native-canvas@^0.1.40 react-native-webview@^14.0.1 --save
```

Expected file changes:

```json
{
  "dependencies": {
    "react-native-canvas": "^0.1.40",
    "react-native-webview": "^14.0.1"
  }
}
```

- [ ] **Step 3: Add local module declarations**

Create `src/types/react-native-canvas.d.ts`:

```ts
declare module 'react-native-canvas' {
  import type { ComponentType, Ref } from 'react';
  import type { ViewProps } from 'react-native';

  export type ReactNativeCanvasContext2D = {
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    font?: string;
    textAlign?: 'left' | 'right' | 'center' | 'start' | 'end';
    beginPath?: () => void;
    closePath?: () => void;
    rect?: (x: number, y: number, width: number, height: number) => void;
    clearRect?: (x: number, y: number, width: number, height: number) => void;
    fillRect?: (x: number, y: number, width: number, height: number) => void;
    strokeRect?: (x: number, y: number, width: number, height: number) => void;
    fill?: () => void;
    stroke?: () => void;
    fillText?: (text: string, x: number, y: number, maxWidth?: number) => void;
    measureText?: (text: string) => Promise<{ width: number }> | { width: number };
    drawImage?: (...args: unknown[]) => void | Promise<void>;
  };

  export type ReactNativeCanvasElement = {
    width?: number;
    height?: number;
    getContext: (type: '2d') => ReactNativeCanvasContext2D | Promise<ReactNativeCanvasContext2D>;
    toDataURL?: (type?: string, encoderOptions?: number) => string | Promise<string>;
  };

  export class Image {
    constructor(canvas: ReactNativeCanvasElement, width?: number, height?: number);
    src?: string;
    addEventListener: (
      type: 'load' | 'error',
      callback: (event?: unknown) => void,
    ) => void;
  }

  export type ReactNativeCanvasProps = ViewProps & {
    ref?: Ref<ReactNativeCanvasElement>;
  };

  const Canvas: ComponentType<ReactNativeCanvasProps>;
  export default Canvas;
}
```

- [ ] **Step 4: Add Jest mocks for default adapter imports**

Append to `tests/setup.ts` before the global `afterEach`:

```ts
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

jest.mock('react-native-canvas', () => {
  const React = require('react');
  const { View } = require('react-native');

  class CanvasImage {
    private listeners = new Map<string, (event?: unknown) => void>();

    addEventListener(type: string, callback: (event?: unknown) => void) {
      this.listeners.set(type, callback);
    }

    set src(_value: string) {
      void Promise.resolve().then(() => this.listeners.get('load')?.());
    }
  }

  const Canvas = React.forwardRef((props: Record<string, unknown>, ref: import('react').ForwardedRef<unknown>) => {
    const context = {
      beginPath: jest.fn(),
      clearRect: jest.fn(),
      closePath: jest.fn(),
      drawImage: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn((text: string) => Promise.resolve({ width: text.length * 8 })),
      rect: jest.fn(),
      stroke: jest.fn(),
      strokeRect: jest.fn(),
    };
    React.useImperativeHandle(ref, () => ({
      getContext: jest.fn(() => Promise.resolve(context)),
      toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mock')),
    }));
    return React.createElement(View, props);
  });

  return { __esModule: true, default: Canvas, Image: CanvasImage };
});
```

- [ ] **Step 5: Run the baseline test harness**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPCateTab.test.tsx
```

Expected: PASS. If this fails, fix only mock-induced breakage in `tests/setup.ts`.

---

### Task 2: UPCanvas Adapter And Public API

**Files:**
- Create: `src/components/canvas/types.ts`
- Create: `src/components/canvas/defaultAdapter.tsx`
- Create: `src/components/canvas/UPCanvas.tsx`
- Create: `src/components/canvas/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Test: `tests/components/UPCanvas.test.tsx`

**Interfaces:**
- Consumes: local `react-native-canvas` declaration from Task 1.
- Produces: `UPCanvas`, `UPCanvasRef`, `UPCanvasProps`, `UPCanvasAdapterComponent`, `UPCanvasDrawCommand`, `UPCanvasExportOptions`, and `UPCanvasExportResult`.
- Produces: global config key `props.canvas` with optional `canvasAdapter`.

- [ ] **Step 1: Write failing canvas tests**

Create `tests/components/UPCanvas.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the failing canvas tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPCanvas.test.tsx
```

Expected: FAIL because `UPCanvas` exports do not exist.

- [ ] **Step 3: Define canvas interfaces**

Create `src/components/canvas/types.ts`:

```ts
import type { ComponentType } from 'react';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

export type UPCanvasTextAlign = 'left' | 'right' | 'center' | 'start' | 'end';
export type UPCanvasUnit = 'px' | 'rpx' | 'upx' | string;

export type UPCanvasDrawCommand =
  | { kind: 'set'; property: 'fillStyle' | 'strokeStyle' | 'lineWidth' | 'font' | 'textAlign'; value: string | number }
  | { kind: 'call'; method: string; args: unknown[] };

export type UPCanvasExportOptions = {
  width?: number;
  height?: number;
  destWidth?: number;
  destHeight?: number;
  fileType?: 'png' | 'jpg' | 'jpeg';
  quality?: number;
};

export type UPCanvasExportResult = {
  tempFilePath: string;
  dataUrl?: string;
  width: number;
  height: number;
};

export type UPCanvasAdapterHandle = {
  execute: (command: UPCanvasDrawCommand) => Promise<unknown>;
  getCanvasElement?: () => unknown | Promise<unknown>;
  getRawContext?: () => unknown | Promise<unknown>;
  measureText?: (text: string) => Promise<{ width: number }>;
  toTempFilePath?: (options?: UPCanvasExportOptions) => Promise<UPCanvasExportResult>;
  refresh?: () => Promise<void>;
};

export type UPCanvasAdapterProps = {
  canvasId: string;
  width: number;
  height: number;
  bgColor?: string;
  disableScroll?: boolean;
  testID: string;
  onReady: (handle: UPCanvasAdapterHandle) => void;
  onError?: (error: Error) => void;
  onTouchStart?: (event: GestureResponderEvent) => void;
  onTouchMove?: (event: GestureResponderEvent) => void;
  onTouchEnd?: (event: GestureResponderEvent) => void;
};

export type UPCanvasAdapterComponent = ComponentType<UPCanvasAdapterProps>;

export type UPCanvasProps = {
  canvasId?: string;
  width?: number | string;
  height?: number | string;
  unit?: UPCanvasUnit;
  useRootHeightAndWidth?: boolean;
  bgColor?: string;
  disableScroll?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  canvasAdapter?: UPCanvasAdapterComponent;
  onReady?: (ref: UPCanvasRef) => void;
  onError?: (error: Error) => void;
  onTouchStart?: (event: GestureResponderEvent) => void;
  onTouchMove?: (event: GestureResponderEvent) => void;
  onTouchEnd?: (event: GestureResponderEvent) => void;
};

export type UPCanvasRef = {
  refresh: () => Promise<void>;
  getWidth: () => number;
  getHeight: () => number;
  getCanvasElement: () => Promise<unknown>;
  getRawContext: () => Promise<unknown>;
  getCanvasContext: () => Promise<unknown>;
  clearCanvas: () => Promise<void>;
  clearRect: (x: number, y: number, width: number, height: number) => Promise<void>;
  rect: (x: number, y: number, width: number, height: number) => Promise<void>;
  fillRect: (x: number, y: number, width: number, height: number) => Promise<void>;
  strokeRect: (x: number, y: number, width: number, height: number) => Promise<void>;
  beginPath: () => Promise<void>;
  closePath: () => Promise<void>;
  fill: () => Promise<void>;
  stroke: () => Promise<void>;
  setFillStyle: (color: string) => Promise<void>;
  setStrokeStyle: (color: string) => Promise<void>;
  setLineWidth: (width: number) => Promise<void>;
  setFont: (font: string) => Promise<void>;
  setFontSize: (size: number) => Promise<void>;
  setTextAlign: (align: UPCanvasTextAlign) => Promise<void>;
  fillText: (text: string, x: number, y: number, maxWidth?: number) => Promise<void>;
  measureText: (text: string) => Promise<{ width: number }>;
  drawImage: (...args: unknown[]) => Promise<void>;
  draw: () => Promise<void>;
  toTempFilePath: (options?: UPCanvasExportOptions) => Promise<UPCanvasExportResult>;
};
```

- [ ] **Step 4: Implement default adapter**

Create `src/components/canvas/defaultAdapter.tsx`:

```tsx
import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import Canvas, { Image as CanvasImage } from 'react-native-canvas';
import type {
  ReactNativeCanvasContext2D,
  ReactNativeCanvasElement,
} from 'react-native-canvas';
import type {
  UPCanvasAdapterComponent,
  UPCanvasAdapterHandle,
  UPCanvasDrawCommand,
  UPCanvasExportOptions,
} from './types';

async function resolveContext(canvas: ReactNativeCanvasElement) {
  return await Promise.resolve(canvas.getContext('2d'));
}

function fontFromSize(size: number) {
  return `${size}px sans-serif`;
}

async function loadCanvasImage(canvas: ReactNativeCanvasElement, source: string) {
  const image = new CanvasImage(canvas);
  await new Promise<void>((resolve, reject) => {
    image.addEventListener('load', () => resolve());
    image.addEventListener('error', () => reject(new Error(`Canvas image failed to load: ${source}`)));
    image.src = source;
  });
  return image;
}

async function executeOnContext(
  canvas: ReactNativeCanvasElement,
  context: ReactNativeCanvasContext2D,
  command: UPCanvasDrawCommand,
) {
  if (command.kind === 'set') {
    if (command.property === 'font' && typeof command.value === 'number') {
      context.font = fontFromSize(command.value);
      return;
    }
    (context as Record<string, unknown>)[command.property] = command.value;
    return;
  }

  if (command.method === 'draw') return;
  if (command.method === 'drawImage' && typeof command.args[0] === 'string') {
    if (!context.drawImage) throw new Error('Canvas method is not available: drawImage');
    const source = command.args[0];
    const rest = command.args.slice(1);
    const image = await loadCanvasImage(canvas, source);
    await Promise.resolve(context.drawImage(image, ...rest));
    return;
  }
  const callable = (context as Record<string, unknown>)[command.method];
  if (typeof callable === 'function') {
    await Promise.resolve(callable.apply(context, command.args));
    return;
  }
  throw new Error(`Canvas method is not available: ${command.method}`);
}

export const UPReactNativeCanvasAdapter: UPCanvasAdapterComponent = ({
  bgColor,
  canvasId,
  disableScroll,
  height,
  onError,
  onReady,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
  testID,
  width,
}) => {
  const contextRef = useRef<ReactNativeCanvasContext2D | null>(null);

  const handleCanvas = useCallback(
    (canvas: ReactNativeCanvasElement | null) => {
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      void resolveContext(canvas).then(
        (context) => {
          contextRef.current = context;
          const handle: UPCanvasAdapterHandle = {
            execute: async (command) => {
              if (!contextRef.current) throw new Error('Canvas context is not ready');
              await executeOnContext(canvas, contextRef.current, command);
            },
            getCanvasElement: async () => canvas,
            getRawContext: async () => contextRef.current,
            measureText: async (text) => {
              if (!contextRef.current?.measureText) return { width: text.length * 8 };
              return await Promise.resolve(contextRef.current.measureText(text));
            },
            toTempFilePath: async (options?: UPCanvasExportOptions) => {
              if (!canvas.toDataURL) throw new Error('Canvas export is not supported');
              const fileType = options?.fileType === 'jpg' || options?.fileType === 'jpeg'
                ? 'jpeg'
                : 'png';
              const dataUrl = await Promise.resolve(
                canvas.toDataURL(`image/${fileType}`, options?.quality),
              );
              return {
                dataUrl,
                height: options?.destHeight ?? options?.height ?? height,
                tempFilePath: dataUrl,
                width: options?.destWidth ?? options?.width ?? width,
              };
            },
          };
          onReady(handle);
        },
        (error: unknown) => onError?.(error instanceof Error ? error : new Error(String(error))),
      );
    },
    [height, onError, onReady, width],
  );

  return (
    <View
      nativeID={canvasId}
      onMoveShouldSetResponder={() => Boolean(disableScroll)}
      onStartShouldSetResponder={() => Boolean(disableScroll)}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      style={{ backgroundColor: bgColor, height, width }}
      testID={testID}
    >
      <Canvas
        ref={handleCanvas}
        style={{ backgroundColor: bgColor, height, width }}
      />
    </View>
  );
};
```

- [ ] **Step 5: Implement `UPCanvas` command queue**

Create `src/components/canvas/UPCanvas.tsx` with these implementation rules:

```tsx
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils/dimensions';
import { UPReactNativeCanvasAdapter } from './defaultAdapter';
import type {
  UPCanvasAdapterHandle,
  UPCanvasDrawCommand,
  UPCanvasExportOptions,
  UPCanvasProps,
  UPCanvasRef,
  UPCanvasUnit,
} from './types';

type QueueEntry = {
  command: UPCanvasDrawCommand;
  reject: (error: Error) => void;
  resolve: () => void;
};

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function commandCall(method: string, args: unknown[] = []): UPCanvasDrawCommand {
  return { args, kind: 'call', method };
}

function resolveCanvasDimension(value: number | string, unit: UPCanvasUnit) {
  if (typeof value === 'number' && /^(rpx|upx)$/i.test(unit)) {
    return getPx(`${value}${unit}`);
  }
  return getPx(value);
}

export const UPCanvas = forwardRef<UPCanvasRef, UPCanvasProps>(function UPCanvas(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.canvas, ...input } as UPCanvasProps;
  const generatedCanvasIdRef = useRef(
    `up-canvas-${Math.random().toString(36).slice(2, 11)}`,
  );
  const canvasId = props.canvasId ?? generatedCanvasIdRef.current;
  const unit = props.unit ?? 'px';
  const configuredWidth = resolveCanvasDimension(props.width ?? 300, unit);
  const configuredHeight = resolveCanvasDimension(props.height ?? 150, unit);
  const [rootSize, setRootSize] = useState<{ height: number; width: number } | null>(null);
  const width = props.useRootHeightAndWidth && rootSize ? rootSize.width : configuredWidth;
  const height = props.useRootHeightAndWidth && rootSize ? rootSize.height : configuredHeight;
  const Adapter = props.canvasAdapter ?? config.props.canvas.canvasAdapter ?? UPReactNativeCanvasAdapter;
  const adapterRef = useRef<UPCanvasAdapterHandle | null>(null);
  const queueRef = useRef<QueueEntry[]>([]);
  const chainRef = useRef(Promise.resolve());
  const mountedRef = useRef(true);
  const publicRef = useRef<UPCanvasRef | null>(null);
  const onError = props.onError;
  const onReady = props.onReady;

  const reportError = useCallback((error: unknown) => {
    const normalized = toError(error);
    if (mountedRef.current) onError?.(normalized);
    return normalized;
  }, [onError]);

  const executeNow = useCallback((command: UPCanvasDrawCommand) => {
    if (!mountedRef.current) throw new Error('Canvas has been unmounted');
    const adapter = adapterRef.current;
    if (!adapter) throw new Error('Canvas adapter is not ready');
    return adapter.execute(command);
  }, []);

  const enqueue = useCallback((command: UPCanvasDrawCommand) => {
    return new Promise<void>((resolve, reject) => {
      if (!mountedRef.current) {
        reject(new Error('Canvas has been unmounted'));
        return;
      }
      const run = () => {
        chainRef.current = chainRef.current
          .then(() => executeNow(command))
          .then(() => resolve())
          .catch((error: unknown) => {
            const normalized = reportError(error);
            reject(normalized);
          });
      };

      if (adapterRef.current) run();
      else queueRef.current.push({ command, reject, resolve });
    });
  }, [executeNow, reportError]);

  const flushQueue = useCallback(() => {
    const entries = queueRef.current.splice(0);
    entries.forEach((entry) => {
      void enqueue(entry.command).then(entry.resolve, entry.reject);
    });
  }, [enqueue]);

  const handleReady = useCallback((handle: UPCanvasAdapterHandle) => {
    if (!mountedRef.current) return;
    adapterRef.current = handle;
    flushQueue();
    if (publicRef.current) onReady?.(publicRef.current);
  }, [flushQueue, onReady]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    if (!props.useRootHeightAndWidth) return;
    const { height: measuredHeight, width: measuredWidth } = event.nativeEvent.layout;
    if (measuredHeight <= 0 || measuredWidth <= 0) return;
    setRootSize((current) =>
      current?.height === measuredHeight && current.width === measuredWidth
        ? current
        : { height: measuredHeight, width: measuredWidth },
    );
  }, [props.useRootHeightAndWidth]);

  useEffect(() => () => {
    mountedRef.current = false;
    adapterRef.current = null;
    const error = new Error('Canvas has been unmounted');
    queueRef.current.splice(0).forEach((entry) => entry.reject(error));
  }, []);

  const api = useMemo<UPCanvasRef>(() => ({
    beginPath: () => enqueue(commandCall('beginPath')),
    clearCanvas: async () => {
      await enqueue(commandCall('clearRect', [0, 0, width, height]));
      if (props.bgColor && props.bgColor !== 'transparent') {
        await enqueue({ kind: 'set', property: 'fillStyle', value: props.bgColor });
        await enqueue(commandCall('fillRect', [0, 0, width, height]));
      }
    },
    clearRect: (x, y, clearWidth, clearHeight) => enqueue(commandCall('clearRect', [x, y, clearWidth, clearHeight])),
    closePath: () => enqueue(commandCall('closePath')),
    draw: () => enqueue(commandCall('draw')),
    drawImage: (...args) => enqueue(commandCall('drawImage', args)),
    fill: () => enqueue(commandCall('fill')),
    fillRect: (x, y, rectWidth, rectHeight) => enqueue(commandCall('fillRect', [x, y, rectWidth, rectHeight])),
    fillText: (text, x, y, maxWidth) => enqueue(commandCall('fillText', maxWidth === undefined ? [text, x, y] : [text, x, y, maxWidth])),
    getCanvasContext: async () => adapterRef.current?.getRawContext?.() ?? null,
    getCanvasElement: async () => adapterRef.current?.getCanvasElement?.() ?? null,
    getHeight: () => height,
    getRawContext: async () => adapterRef.current?.getRawContext?.() ?? null,
    getWidth: () => width,
    measureText: async (text) => adapterRef.current?.measureText?.(text) ?? { width: text.length * 8 },
    rect: (x, y, rectWidth, rectHeight) => enqueue(commandCall('rect', [x, y, rectWidth, rectHeight])),
    refresh: async () => {
      await adapterRef.current?.refresh?.();
    },
    setFillStyle: (color) => enqueue({ kind: 'set', property: 'fillStyle', value: color }),
    setFont: (font) => enqueue({ kind: 'set', property: 'font', value: font }),
    setFontSize: (size) => enqueue({ kind: 'set', property: 'font', value: size }),
    setLineWidth: (lineWidth) => enqueue({ kind: 'set', property: 'lineWidth', value: lineWidth }),
    setStrokeStyle: (color) => enqueue({ kind: 'set', property: 'strokeStyle', value: color }),
    setTextAlign: (align) => enqueue({ kind: 'set', property: 'textAlign', value: align }),
    stroke: () => enqueue(commandCall('stroke')),
    strokeRect: (x, y, rectWidth, rectHeight) => enqueue(commandCall('strokeRect', [x, y, rectWidth, rectHeight])),
    toTempFilePath: async (options?: UPCanvasExportOptions) => {
      const adapter = adapterRef.current;
      if (!adapter?.toTempFilePath) throw reportError(new Error('Canvas export is not supported'));
      return adapter.toTempFilePath(options);
    },
  }), [enqueue, height, props.bgColor, reportError, width]);

  publicRef.current = api;
  useImperativeHandle(ref, () => api, [api]);
  const shouldRenderAdapter = !props.useRootHeightAndWidth || rootSize !== null;

  return (
    <View
      onLayout={handleLayout}
      style={[
        { backgroundColor: props.bgColor },
        props.useRootHeightAndWidth ? null : { height, width },
        props.customStyle,
      ]}
      testID="up-canvas"
    >
      {shouldRenderAdapter ? (
        <Adapter
          bgColor={props.bgColor}
          canvasId={canvasId}
          disableScroll={props.disableScroll}
          height={height}
          onError={props.onError}
          onReady={handleReady}
          onTouchEnd={props.onTouchEnd}
          onTouchMove={props.onTouchMove}
          onTouchStart={props.onTouchStart}
          testID={`up-canvas-${canvasId}`}
          width={width}
        />
      ) : null}
    </View>
  );
});
```

This code block is the implementation contract. Keep the shown lifecycle guard, root measurement, queue rejection, and background repaint behavior unchanged unless a failing test proves a repository-specific adjustment is required.

- [ ] **Step 6: Add canvas defaults and exports**

Modify `src/config/defaults.ts` by adding a type and `sourceDefaults.props.canvas` entry:

```ts
import type { UPCanvasAdapterComponent } from '../components/canvas';

export type UPCanvasDefaults = {
  width: number | string;
  height: number | string;
  unit: string;
  useRootHeightAndWidth: boolean;
  bgColor: string;
  disableScroll: boolean;
  canvasAdapter?: UPCanvasAdapterComponent;
};

canvas: Object.freeze({
  width: 300,
  height: 150,
  unit: 'px',
  useRootHeightAndWidth: false,
  bgColor: 'transparent',
  disableScroll: false,
  canvasAdapter: undefined,
}),
```

Modify `src/config/store.ts` in the three existing config sections:

```ts
canvas?: Partial<UPProps['canvas']>;
canvas: { ...sourceDefaults.props.canvas },
canvas: { ...state.props.canvas, ...overrides.props?.canvas },
```

Create `src/components/canvas/index.ts`:

```ts
export * from './UPCanvas';
export * from './defaultAdapter';
export * from './types';
```

- [ ] **Step 7: Run canvas tests and typecheck**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPCanvas.test.tsx
npm run typecheck
```

Expected: PASS.

---

### Task 3: QR Encoder And UPQrcode

**Files:**
- Create: `src/components/qrcode/qrEncoder.ts`
- Create: `src/components/qrcode/UPQrcode.tsx`
- Create: `src/components/qrcode/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Test: `tests/components/UPQrcode.test.tsx`

**Interfaces:**
- Consumes: `UPCanvas`, `UPCanvasRef`, and `UPCanvasAdapterComponent` from Task 2.
- Produces: `encodeQrMatrix(value, options): UPQrMatrix`.
- Produces: `UPQrcode`, `UPQrcodeRef`, `UPQrcodeProps`, and `UPQrcodeResult`.
- Produces: global config key `props.qrcode`.

- [ ] **Step 1: Write failing QR tests**

Create `tests/components/UPQrcode.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the failing QR tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPQrcode.test.tsx
```

Expected: FAIL because QR exports do not exist.

- [ ] **Step 3: Implement `qrEncoder.ts`**

Create `src/components/qrcode/qrEncoder.ts` from the pure matrix parts in:

```text
D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus\components\u-qrcode\qrcode.js
```

Copy these encoder internals into the TypeScript module: `QRCodeAlg`, `QRUtil`, `QRMath`, `QRPolynomial`, `QRBitBuffer`, `QRRSBlock`, `RS_BLOCK_TABLE`, `QRErrorCorrectLevel`, and their directly used constants. Remove drawing, `uni`, image, timer, callback, and export branches. Expose this typed wrapper:

```ts
export type UPQrCorrectLevel = 0 | 1 | 2 | 3;

export type UPQrMatrix = {
  modules: boolean[][];
  size: number;
};

export type UPQrEncodeOptions = {
  correctLevel?: UPQrCorrectLevel | number;
};

export function encodeQrMatrix(value: string, options: UPQrEncodeOptions = {}): UPQrMatrix {
  const text = String(value);
  if (!text) throw new Error('QR value cannot be empty');
  const level = normalizeCorrectLevel(options.correctLevel);
  const qrCode = new QRCodeAlg(text, level);
  const size = qrCode.getModuleCount();
  const modules = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => Boolean(qrCode.modules[row][col])),
  );
  return { modules, size };
}
```

The upstream `QRCodeAlg` constructor already invokes `make()`, so do not call it a second time. The fixture `encodeQrMatrix('ultra', { correctLevel: 3 })` was checked against the upstream algorithm and must produce a `21 × 21` matrix whose first seven modules are dark. Use these boundary helpers:

```ts
function getUTF8Bytes(input: string): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

function normalizeCorrectLevel(level: UPQrCorrectLevel | number | undefined): UPQrCorrectLevel {
  if (level === 0 || level === 1 || level === 2 || level === 3) return level;
  return 3;
}
```

- [ ] **Step 4: Implement `UPQrcode` rendering**

Create `src/components/qrcode/UPQrcode.tsx` with these public types:

```ts
export type UPQrcodeResult = {
  canvasId: string;
  matrixSize: number;
  tempFilePath: string | null;
  value: string;
};

export type UPQrcodeRef = {
  makeCode: () => Promise<UPQrcodeResult>;
  clearCode: () => Promise<void>;
  toTempFilePath: () => Promise<UPCanvasExportResult>;
  preview: () => Promise<void>;
  longpress: () => Promise<void>;
};

export type UPQrcodeProps = {
  cid?: string;
  canvasId?: string;
  size?: number | string;
  unit?: string;
  show?: boolean;
  val?: string;
  background?: string;
  foreground?: string;
  pdground?: string;
  icon?: string;
  iconSize?: number | string;
  lv?: UPQrCorrectLevel | number;
  quietZone?: number | string;
  onval?: boolean;
  loadMake?: boolean;
  usingComponents?: boolean;
  showLoading?: boolean;
  loadingText?: string;
  allowPreview?: boolean;
  useRootHeightAndWidth?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  canvasAdapter?: UPCanvasAdapterComponent;
  onResult?: (result: UPQrcodeResult) => void;
  onPreview?: (result: UPQrcodeResult | null) => void;
  onLongpressCallback?: (tempFilePath: string) => void;
  onError?: (error: Error) => void;
};
```

Use this drawing sequence:

```ts
type RequiredQrDrawProps = {
  background: string;
  foreground: string;
  icon: string;
  iconSize: number | string;
  lv: UPQrCorrectLevel | number;
  pdground: string;
  quietZone: number | string;
  size: number | string;
  unit: string;
  useRootHeightAndWidth: boolean;
  val: string;
};

function isFinderCore(row: number, col: number, count: number) {
  const inCore = (value: number, origin: number) =>
    value >= origin + 2 && value <= origin + 4;
  return (
    (inCore(row, 0) && inCore(col, 0)) ||
    (inCore(row, count - 7) && inCore(col, 0)) ||
    (inCore(row, 0) && inCore(col, count - 7))
  );
}

function resolveQrDimension(value: number | string, unit: string) {
  if (typeof value === 'number' && /^(rpx|upx)$/i.test(unit)) {
    return getPx(`${value}${unit}`);
  }
  return getPx(value);
}

async function drawQr(canvas: UPCanvasRef, props: RequiredQrDrawProps) {
  const size = props.useRootHeightAndWidth
    ? Math.min(canvas.getWidth(), canvas.getHeight())
    : resolveQrDimension(props.size, props.unit);
  const quietZone = Math.max(0, Math.floor(Number(props.quietZone) || 0));
  const matrix = encodeQrMatrix(props.val, { correctLevel: props.lv });
  const renderCount = matrix.size + quietZone * 2;
  const moduleSize = size / renderCount;

  await canvas.setFillStyle(props.background);
  await canvas.fillRect(0, 0, size, size);
  let activeColor = '';

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (matrix.modules[row][col]) {
        const color = isFinderCore(row, col, matrix.size)
          ? props.pdground
          : props.foreground;
        if (color !== activeColor) {
          await canvas.setFillStyle(color);
          activeColor = color;
        }
        await canvas.fillRect(
          Math.round((quietZone + col) * moduleSize),
          Math.round((quietZone + row) * moduleSize),
          Math.ceil(moduleSize),
          Math.ceil(moduleSize),
        );
      }
    }
  }

  if (props.icon) {
    const iconSize = resolveQrDimension(props.iconSize, props.unit);
    const iconX = (size - iconSize) / 2;
    const iconY = (size - iconSize) / 2;
    await canvas.drawImage(props.icon, iconX, iconY, iconSize, iconSize);
  }

  await canvas.draw();
  return matrix;
}
```

Implement component lifecycle and compatibility hooks with these rules:

```ts
type ResolvedQrcodeProps = UPQrcodeProps &
  RequiredQrDrawProps & {
    allowPreview: boolean;
    loadMake: boolean;
    loadingText: string;
    onval: boolean;
    showLoading: boolean;
  };

const props = {
  ...useUPConfig().props.qrcode,
  ...input,
} as ResolvedQrcodeProps;

const reportedErrorsRef = useRef(new WeakSet<Error>());
const reportError = useCallback((caught: unknown) => {
  const normalized = caught instanceof Error ? caught : new Error(String(caught));
  if (!reportedErrorsRef.current.has(normalized)) {
    reportedErrorsRef.current.add(normalized);
    props.onError?.(normalized);
  }
  return normalized;
}, [props.onError]);

const normalizedDrawProps = useMemo<RequiredQrDrawProps>(() => ({
  background: props.background,
  foreground: props.foreground,
  icon: props.icon,
  iconSize: props.iconSize,
  lv: props.lv,
  pdground: props.pdground,
  quietZone: props.quietZone,
  size: props.size,
  unit: props.unit,
  useRootHeightAndWidth: props.useRootHeightAndWidth,
  val: props.val,
}), [
  props.background,
  props.foreground,
  props.icon,
  props.iconSize,
  props.lv,
  props.pdground,
  props.quietZone,
  props.size,
  props.unit,
  props.useRootHeightAndWidth,
  props.val,
]);

const [canvasReady, setCanvasReady] = useState(false);
const [loading, setLoading] = useState(false);
const canvasRef = useRef<UPCanvasRef>(null);
const generatedCanvasIdRef = useRef(
  `up-qrcode-${Math.random().toString(36).slice(2, 11)}`,
);
const canvasId = props.canvasId ?? props.cid ?? generatedCanvasIdRef.current;
const generatedRef = useRef(false);
const previousValueRef = useRef(props.val);
const resultRef = useRef<UPQrcodeResult | null>(null);

const makeCode = useCallback(async () => {
  const canvas = canvasRef.current;
  if (!canvas) throw reportError(new Error('QR canvas is not ready'));
  setLoading(true);
  try {
    const matrix = await drawQr(canvas, normalizedDrawProps);
    const result: UPQrcodeResult = {
      canvasId,
      matrixSize: matrix.size,
      tempFilePath: null,
      value: props.val,
    };
    resultRef.current = result;
    props.onResult?.(result);
    return result;
  } catch (error) {
    throw reportError(error);
  } finally {
    setLoading(false);
  }
}, [canvasId, normalizedDrawProps, props.onResult, props.val, reportError]);

useEffect(() => {
  if (!canvasReady) return;
  const changed = previousValueRef.current !== props.val;
  previousValueRef.current = props.val;
  if (!generatedRef.current) {
    generatedRef.current = true;
    if (props.loadMake) void makeCode().catch(() => undefined);
    return;
  }
  if (changed && props.onval) void makeCode().catch(() => undefined);
}, [canvasReady, makeCode, props.loadMake, props.onval, props.val]);

const toTempFilePath = useCallback(async () => {
  try {
    const exported = await canvasRef.current?.toTempFilePath();
    if (!exported) throw new Error('QR canvas is not ready');
    if (resultRef.current) {
      resultRef.current = {
        ...resultRef.current,
        tempFilePath: exported.tempFilePath,
      };
    }
    return exported;
  } catch (error) {
    throw reportError(error);
  }
}, [reportError]);

const preview = useCallback(async () => {
  if (props.allowPreview) await toTempFilePath();
  props.onPreview?.(resultRef.current);
}, [props.allowPreview, props.onPreview, toTempFilePath]);

const longpress = useCallback(async () => {
  const exported = await toTempFilePath();
  props.onLongpressCallback?.(exported.tempFilePath);
}, [props.onLongpressCallback, toTempFilePath]);
```

Import `Pressable` and `View` from React Native plus `UPLoadingIcon` from the existing component folder. Render `UPCanvas` inside a `Pressable` with `testID="up-qrcode-content"`, `onPress={() => void preview().catch(() => undefined)}`, and `onLongPress={() => void longpress().catch(() => undefined)}`. Define `const handleCanvasReady = useCallback(() => setCanvasReady(true), [])`, pass it to `UPCanvas.onReady`, pass `onError={reportError}`, and pass `useRootHeightAndWidth` through. Give the `Pressable` `position: 'relative'`; when root sizing is disabled, also give it the converted square `height` and `width`, and apply `props.customStyle` last. Render the loading overlay while drawing:

```tsx
{props.showLoading && loading ? (
  <View
    pointerEvents="none"
    style={{
      alignItems: 'center',
      backgroundColor: '#f7f7f7',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    }}
    testID="up-qrcode-loading"
  >
    <UPLoadingIcon text={props.loadingText} vertical />
  </View>
) : null}
```

`clearCode()` must call `canvasRef.current?.clearCanvas()`, set `resultRef.current = null`, and leave later `makeCode()` calls usable. `preview()` always emits `onPreview`; `allowPreview=true` additionally attempts adapter export first. `longpress()` always exports first and calls `onLongpressCallback` only after a path exists.

- [ ] **Step 5: Add QR defaults and exports**

Modify `src/config/defaults.ts`:

```ts
export type UPQrcodeDefaults = {
  size: number;
  unit: string;
  show: boolean;
  val: string;
  background: string;
  foreground: string;
  pdground: string;
  icon: string;
  iconSize: number;
  lv: number;
  quietZone: number;
  onval: boolean;
  loadMake: boolean;
  usingComponents: boolean;
  showLoading: boolean;
  loadingText: string;
  allowPreview: boolean;
  useRootHeightAndWidth: boolean;
};

qrcode: Object.freeze({
  allowPreview: false,
  background: '#ffffff',
  foreground: '#000000',
  icon: '',
  iconSize: 40,
  loadMake: true,
  loadingText: '生成中',
  lv: 3,
  onval: true,
  pdground: '#000000',
  quietZone: 0,
  show: true,
  showLoading: true,
  size: 200,
  unit: 'px',
  useRootHeightAndWidth: false,
  usingComponents: true,
  val: '',
}),
```

Modify `src/config/store.ts` in the three existing config sections:

```ts
qrcode?: Partial<UPProps['qrcode']>;
qrcode: { ...sourceDefaults.props.qrcode },
qrcode: { ...state.props.qrcode, ...overrides.props?.qrcode },
```

Create `src/components/qrcode/index.ts`:

```ts
export * from './UPQrcode';
export * from './qrEncoder';
```

- [ ] **Step 6: Run QR tests and typecheck**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPQrcode.test.tsx
npm run typecheck
```

Expected: PASS.

---

### Task 4: Barcode Encoder And UPBarcode

**Files:**
- Create: `src/components/barcode/barcodeEncoder.ts`
- Create: `src/components/barcode/UPBarcode.tsx`
- Create: `src/components/barcode/index.ts`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Test: `tests/components/UPBarcode.test.tsx`

**Interfaces:**
- Consumes: `UPCanvas`, `UPCanvasRef`, and `UPCanvasAdapterComponent` from Task 2.
- Produces: `encodeBarcode(value, format): UPBarcodeEncoding`.
- Produces: `UPBarcode`, `UPBarcodeRef`, `UPBarcodeProps`, and `UPBarcodeResult`.
- Produces: global config key `props.barcode`.

- [ ] **Step 1: Write failing barcode tests**

Create `tests/components/UPBarcode.test.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import {
  UPBarcode,
  UPRoot,
  encodeBarcode,
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
        measureText: async (text) => ({ width: text.length * 8 }),
        toTempFilePath: exportable
          ? async () => ({ height: 80, tempFilePath: 'data:image/png;base64,barcode', width: 200 })
          : undefined,
      });
    }, [onReady]);
    return <View testID={testID} />;
  };
}

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('encodes CODE128 and auto format deterministically', () => {
  const code128 = encodeBarcode('ABC123', 'CODE128');
  const automatic = encodeBarcode('ABC123', 'auto');

  expect(code128.format).toBe('CODE128');
  expect(code128.binary.startsWith('11010010000')).toBe(true);
  expect(code128.binary.endsWith('1100011101011')).toBe(true);
  expect(automatic.binary).toBe(code128.binary);
});

it('encodes numeric and source-listed families', () => {
  expect(encodeBarcode('ABC123', 'CODE128A').format).toBe('CODE128A');
  expect(encodeBarcode('abc123', 'CODE128B').format).toBe('CODE128B');
  expect(encodeBarcode('001122', 'CODE128C').format).toBe('CODE128C');
  expect(encodeBarcode('5901234123457', 'EAN13').format).toBe('EAN13');
  expect(encodeBarcode('96385074', 'EAN8').format).toBe('EAN8');
  expect(encodeBarcode('12345', 'EAN5').format).toBe('EAN5');
  expect(encodeBarcode('12', 'EAN2').format).toBe('EAN2');
  expect(encodeBarcode('12345678901', 'UPC').format).toBe('UPC');
  expect(encodeBarcode('12345678901', 'UPCA').format).toBe('UPCA');
  expect(encodeBarcode('123456', 'UPCE').format).toBe('UPCE');
  expect(encodeBarcode('ABC-123', 'CODE39').format).toBe('CODE39');
  expect(encodeBarcode('123456', 'ITF').format).toBe('ITF');
  expect(encodeBarcode('1234567890123', 'ITF14').format).toBe('ITF14');
  expect(encodeBarcode('123456', 'MSI').format).toBe('MSI');
  expect(encodeBarcode('123456', 'MSI10').format).toBe('MSI10');
  expect(encodeBarcode('123456', 'MSI11').format).toBe('MSI11');
  expect(encodeBarcode('123456', 'MSI1010').format).toBe('MSI1010');
  expect(encodeBarcode('123456', 'MSI1110').format).toBe('MSI1110');
  expect(encodeBarcode('12345', 'pharmacode').format).toBe('pharmacode');
  expect(encodeBarcode('A123B', 'codabar').format).toBe('codabar');
  expect(() => encodeBarcode('123', 'CODE128C')).toThrow('CODE128C requires an even number of digits');
  expect(() => encodeBarcode('2', 'pharmacode')).toThrow('pharmacode must be between 3 and 131070');
});

it('draws bars, margins, and bottom text', async () => {
  const commands: UPCanvasDrawCommand[] = [];
  const onResult = jest.fn();

  renderRoot(
    <UPBarcode
      canvasAdapter={createRecordingAdapter(commands)}
      canvasId="barcode-a"
      height={80}
      margin={10}
      onResult={onResult}
      value="ABC123"
      width={200}
    />,
  );

  await waitFor(() => expect(onResult).toHaveBeenCalledTimes(1));
  expect(commands).toContainEqual({ kind: 'set', property: 'fillStyle', value: '#ffffff' });
  expect(commands).toContainEqual({ args: [0, 0, 220, 116], kind: 'call', method: 'fillRect' });
  expect(commands.some((command) => command.kind === 'call' && command.method === 'fillText')).toBe(true);
});

it('reports invalid values and unsupported formats', async () => {
  expect(() => encodeBarcode('abc', 'EAN13')).toThrow('EAN13 must be 12 or 13 digits');
  expect(() => encodeBarcode('abc', 'UNKNOWN' as never)).toThrow('Unsupported barcode format: UNKNOWN');

  const onError = jest.fn();
  const screen = renderRoot(
    <UPBarcode canvasAdapter={createRecordingAdapter([])} format="EAN13" onError={onError} value="abc" />,
  );

  await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'EAN13 must be 12 or 13 digits' })));
  expect(screen.getByTestId('up-barcode-error').props.children).toBe('EAN13 must be 12 or 13 digits');
});

it('renders an exported image when useCanvas is false and export is supported', async () => {
  const onResult = jest.fn();
  const screen = renderRoot(
    <UPBarcode
      canvasAdapter={createRecordingAdapter([], true)}
      onResult={onResult}
      useCanvas={false}
      value="ABC123"
    />,
  );

  await waitFor(() =>
    expect(screen.getByTestId('up-barcode-image').props.source).toEqual({
      uri: 'data:image/png;base64,barcode',
    }),
  );
  expect(onResult).toHaveBeenCalledWith(
    expect.objectContaining({ tempFilePath: 'data:image/png;base64,barcode' }),
  );
});

it('rejects useCanvas=false when export is unsupported', async () => {
  const onError = jest.fn();
  const ref = React.createRef<import('../../src').UPBarcodeRef>();

  renderRoot(
    <UPBarcode
      canvasAdapter={createRecordingAdapter([])}
      onError={onError}
      ref={ref}
      useCanvas={false}
      value="ABC123"
    />,
  );

  await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Canvas export is not supported' })));
  await act(async () => {
    await expect(ref.current?.toTempFilePath()).rejects.toThrow('Canvas export is not supported');
  });
});
```

- [ ] **Step 2: Run the failing barcode tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPBarcode.test.tsx
```

Expected: FAIL because barcode exports do not exist.

- [ ] **Step 3: Implement barcode encoder**

Create `src/components/barcode/barcodeEncoder.ts` with these public types:

```ts
export type UPBarcodeFormat =
  | 'auto'
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'EAN13'
  | 'EAN8'
  | 'EAN5'
  | 'EAN2'
  | 'UPC'
  | 'UPCA'
  | 'UPCE'
  | 'CODE39'
  | 'ITF'
  | 'ITF14'
  | 'MSI'
  | 'MSI10'
  | 'MSI11'
  | 'MSI1010'
  | 'MSI1110'
  | 'pharmacode'
  | 'codabar';

export type UPBarcodeEncoding = {
  binary: string;
  format: Exclude<UPBarcodeFormat, 'auto'>;
  text: string;
};
```

Implement source-compatible encoder dispatch:

```ts
const FORMAT_ORDER: Exclude<UPBarcodeFormat, 'auto'>[] = [
  'CODE128',
  'EAN13',
  'EAN8',
  'EAN5',
  'EAN2',
  'UPCA',
  'UPCE',
  'CODE39',
  'ITF',
  'ITF14',
  'MSI',
  'MSI10',
  'MSI11',
  'MSI1010',
  'MSI1110',
  'pharmacode',
  'codabar',
];

export function encodeBarcode(value: string | number, format: UPBarcodeFormat = 'auto'): UPBarcodeEncoding {
  const text = String(value);
  if (!text) throw new Error('Barcode value cannot be empty');
  if (format === 'auto') {
    for (const candidate of FORMAT_ORDER) {
      try {
        return encodeBarcode(text, candidate);
      } catch {
      }
    }
    throw new Error(`No compatible barcode format for value: ${text}`);
  }

  switch (format) {
    case 'CODE128':
    case 'CODE128A':
    case 'CODE128B':
    case 'CODE128C':
      return encodeCode128(text, format);
    case 'EAN13':
      return encodeEAN13(text);
    case 'EAN8':
      return encodeEAN8(text);
    case 'EAN5':
    case 'EAN2':
      return encodeEAN52(text, format);
    case 'UPC':
    case 'UPCA':
      return encodeUPCA(text, format);
    case 'UPCE':
      return encodeUPCE(text);
    case 'CODE39':
      return encodeCode39(text);
    case 'ITF':
      return encodeITF(text, false);
    case 'ITF14':
      return encodeITF(text, true);
    case 'MSI':
    case 'MSI10':
    case 'MSI11':
    case 'MSI1010':
    case 'MSI1110':
      return encodeMSI(text, format);
    case 'pharmacode':
      return encodePharmacode(text);
    case 'codabar':
      return encodeCodabar(text);
    default:
      throw new Error(`Unsupported barcode format: ${format}`);
  }
}
```

Implement every dispatched encoder in the same file. Use string tables so leading zeroes are never lost:

```ts
type ConcreteBarcodeFormat = Exclude<UPBarcodeFormat, 'auto'>;

const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100', '1100011101011',
] as const;

function encodeCode128(
  value: string,
  format: 'CODE128' | 'CODE128A' | 'CODE128B' | 'CODE128C',
): UPBarcodeEncoding {
  const set = format === 'CODE128A'
    ? 'A'
    : format === 'CODE128C'
      ? 'C'
      : format === 'CODE128B'
        ? 'B'
        : /^\d+$/.test(value) && value.length % 2 === 0
          ? 'C'
          : 'B';

  if (set === 'A' && !/^[\x00-\x5f]+$/.test(value)) {
    throw new Error('CODE128A supports ASCII 0 through 95');
  }
  if (set === 'B' && !/^[\x20-\x7f]+$/.test(value)) {
    throw new Error('CODE128B supports ASCII 32 through 127');
  }
  if (set === 'C' && !/^(?:\d{2})+$/.test(value)) {
    throw new Error('CODE128C requires an even number of digits');
  }

  const start = set === 'A' ? 103 : set === 'B' ? 104 : 105;
  const dataCodes = set === 'C'
    ? value.match(/.{2}/g)?.map(Number) ?? []
    : Array.from(value, (character) => {
        const code = character.charCodeAt(0);
        return set === 'A' ? (code < 32 ? code + 64 : code - 32) : code - 32;
      });
  const checksum = dataCodes.reduce(
    (sum, code, index) => sum + code * (index + 1),
    start,
  ) % 103;
  const binary = [start, ...dataCodes, checksum, 106]
    .map((code) => CODE128_PATTERNS[code])
    .join('');
  return { binary, format, text: value };
}

const CODE39_PATTERNS: Record<string, string> = {
  '0': '101000111011101', '1': '111010001010111', '2': '101110001010111',
  '3': '111011100010101', '4': '101000111010111', '5': '111010001110101',
  '6': '101110001110101', '7': '101000101110111', '8': '111010001011101',
  '9': '101110001011101', A: '111010100010111', B: '101110100010111',
  C: '111011101000101', D: '101011100010111', E: '111010111000101',
  F: '101110111000101', G: '101010001110111', H: '111010100011101',
  I: '101110100011101', J: '101011100011101', K: '111010101000111',
  L: '101110101000111', M: '111011101010001', N: '101011101000111',
  O: '111010111010001', P: '101110111010001', Q: '101010111000111',
  R: '111010101110001', S: '101110101110001', T: '101011101110001',
  U: '111000101010111', V: '100011101010111', W: '111000111010101',
  X: '100010111010111', Y: '111000101110101', Z: '100011101110101',
  '-': '100010101110111', '.': '111000101011101', ' ': '100011101011101',
  '*': '100010111011101', '$': '100010001000101', '/': '100010001010001',
  '+': '100010100010001', '%': '101000100010001',
};

function encodeCode39(value: string): UPBarcodeEncoding {
  const text = value.toUpperCase();
  if (!/^[0-9A-Z\-.$/+% ]+$/.test(text)) {
    throw new Error(`Invalid character in CODE39: ${value}`);
  }
  const payload = Array.from(text, (character) => CODE39_PATTERNS[character]).join('0');
  return {
    binary: `${CODE39_PATTERNS['*']}0${payload}0${CODE39_PATTERNS['*']}`,
    format: 'CODE39',
    text,
  };
}

const EAN_BINARIES = {
  L: ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
  G: ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
  R: ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'],
  O: ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
  E: ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
} as const;
const EAN13_STRUCTURE = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'] as const;
const EAN2_STRUCTURE = ['LL', 'LG', 'GL', 'GG'] as const;
const EAN5_STRUCTURE = ['GGLLL', 'GLGLL', 'GLLGL', 'GLLLG', 'LGGLL', 'LLGGL', 'LLLGG', 'LGLGL', 'LGLLG', 'LLGLG'] as const;

function encodeEanDigits(value: string, structure: string, separator = '') {
  return Array.from(value, (digit, index) => {
    const encoded = EAN_BINARIES[structure[index] as keyof typeof EAN_BINARIES][Number(digit)];
    return index < value.length - 1 ? `${encoded}${separator}` : encoded;
  }).join('');
}

function ean13Check(value: string) {
  const sum = Array.from(value.slice(0, 12), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

function ean8Check(value: string) {
  const sum = Array.from(value.slice(0, 7), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

function upcaCheck(value: string) {
  const sum = Array.from(value.slice(0, 11), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

function encodeEAN13(value: string): UPBarcodeEncoding {
  if (!/^\d{12,13}$/.test(value)) throw new Error('EAN13 must be 12 or 13 digits');
  const normalized = value.length === 12 ? `${value}${ean13Check(value)}` : value;
  if (Number(normalized[12]) !== ean13Check(normalized)) {
    throw new Error('Invalid EAN13 check digit');
  }
  const binary =
    `101${encodeEanDigits(normalized.slice(1, 7), EAN13_STRUCTURE[Number(normalized[0])])}` +
    `01010${encodeEanDigits(normalized.slice(7), 'RRRRRR')}101`;
  return { binary, format: 'EAN13', text: normalized };
}

function encodeEAN8(value: string): UPBarcodeEncoding {
  if (!/^\d{7,8}$/.test(value)) throw new Error('EAN8 must be 7 or 8 digits');
  const normalized = value.length === 7 ? `${value}${ean8Check(value)}` : value;
  if (Number(normalized[7]) !== ean8Check(normalized)) {
    throw new Error('Invalid EAN8 check digit');
  }
  const binary =
    `101${encodeEanDigits(normalized.slice(0, 4), 'LLLL')}` +
    `01010${encodeEanDigits(normalized.slice(4), 'RRRR')}101`;
  return { binary, format: 'EAN8', text: normalized };
}

function encodeEAN52(value: string, format: 'EAN5' | 'EAN2'): UPBarcodeEncoding {
  const expected = format === 'EAN5' ? 5 : 2;
  if (!new RegExp(`^\\d{${expected}}$`).test(value)) {
    throw new Error(`${format} must be ${expected} digits`);
  }
  const structure = format === 'EAN5'
    ? EAN5_STRUCTURE[
        Array.from(value, Number).reduce(
          (sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 9),
          0,
        ) % 10
      ]
    : EAN2_STRUCTURE[Number(value) % 4];
  return {
    binary: `1011${encodeEanDigits(value, structure, '01')}`,
    format,
    text: value,
  };
}

function encodeUPCA(value: string, format: 'UPC' | 'UPCA' = 'UPCA'): UPBarcodeEncoding {
  if (!/^\d{11,12}$/.test(value)) throw new Error('UPC-A must be 11 or 12 digits');
  const normalized = value.length === 11 ? `${value}${upcaCheck(value)}` : value;
  if (Number(normalized[11]) !== upcaCheck(normalized)) {
    throw new Error('Invalid UPC-A check digit');
  }
  const binary =
    `101${encodeEanDigits(normalized.slice(0, 6), 'LLLLLL')}` +
    `01010${encodeEanDigits(normalized.slice(6), 'RRRRRR')}101`;
  return { binary, format, text: normalized };
}

const UPCE_EXPANSIONS = [
  'XX00000XXX', 'XX10000XXX', 'XX20000XXX', 'XXX00000XX', 'XXXX00000X',
  'XXXXX00005', 'XXXXX00006', 'XXXXX00007', 'XXXXX00008', 'XXXXX00009',
] as const;
const UPCE_PARITIES = [
  ['EEEOOO', 'OOOEEE'], ['EEOEOO', 'OOEOEE'], ['EEOOEO', 'OOEEOE'],
  ['EEOOOE', 'OOEEEO'], ['EOEEOO', 'OEOOEE'], ['EOOEEO', 'OEEOOE'],
  ['EOOOEE', 'OEEEOO'], ['EOEOEO', 'OEOEOE'], ['EOEOOE', 'OEOEEO'],
  ['EOOEOE', 'OEEOEO'],
] as const;

function expandUPCE(middle: string, system: '0' | '1') {
  const expansion = UPCE_EXPANSIONS[Number(middle[5])];
  let digitIndex = 0;
  const body = Array.from(expansion, (character) =>
    character === 'X' ? middle[digitIndex++] : character,
  ).join('');
  const prefix = `${system}${body}`;
  return `${prefix}${upcaCheck(prefix)}`;
}

function encodeUPCE(value: string): UPBarcodeEncoding {
  let middle: string;
  let system: '0' | '1';
  let upca: string;
  if (/^\d{6}$/.test(value)) {
    middle = value;
    system = '0';
    upca = expandUPCE(middle, system);
  } else if (/^[01]\d{7}$/.test(value)) {
    system = value[0] as '0' | '1';
    middle = value.slice(1, 7);
    upca = expandUPCE(middle, system);
    if (upca[11] !== value[7]) throw new Error('Invalid UPC-E check digit');
  } else {
    throw new Error('UPC-E must be 6 or 8 digits');
  }
  const check = Number(upca[11]);
  const structure = UPCE_PARITIES[check][Number(system)];
  return {
    binary: `101${encodeEanDigits(middle, structure)}010101`,
    format: 'UPCE',
    text: `${system}${middle}${check}`,
  };
}

const ITF_PATTERNS = ['00110', '10001', '01001', '11000', '00101', '10100', '01100', '00011', '10010', '01010'] as const;

function itf14Check(value: string) {
  const sum = Array.from(value.slice(0, 13), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

function encodeITF(value: string, fixed14: boolean): UPBarcodeEncoding {
  let normalized = value;
  if (fixed14) {
    if (!/^\d{13,14}$/.test(value)) throw new Error('ITF14 must be 13 or 14 digits');
    normalized = value.length === 13 ? `${value}${itf14Check(value)}` : value;
    if (Number(normalized[13]) !== itf14Check(normalized)) {
      throw new Error('Invalid ITF14 check digit');
    }
  } else if (!/^(?:\d{2})+$/.test(value)) {
    throw new Error('ITF must contain an even number of digits');
  }

  let binary = '1010';
  for (let index = 0; index < normalized.length; index += 2) {
    const first = ITF_PATTERNS[Number(normalized[index])];
    const second = ITF_PATTERNS[Number(normalized[index + 1])];
    for (let unit = 0; unit < 5; unit += 1) {
      binary += first[unit] === '1' ? '111' : '1';
      binary += second[unit] === '1' ? '000' : '0';
    }
  }
  binary += '11101';
  return { binary, format: fixed14 ? 'ITF14' : 'ITF', text: normalized };
}

function msiMod10(value: string) {
  const sum = Array.from(value, Number).reduce((total, digit, index) => {
    if ((index + value.length) % 2 === 0) return total + digit;
    const doubled = digit * 2;
    return total + (doubled % 10) + Math.floor(doubled / 10);
  }, 0);
  return (10 - (sum % 10)) % 10;
}

function msiMod11(value: string) {
  const weights = [2, 3, 4, 5, 6, 7];
  const sum = Array.from(value, Number).reduce(
    (total, _digit, index) =>
      total + Number(value[value.length - 1 - index]) * weights[index % weights.length],
    0,
  );
  return (11 - (sum % 11)) % 11;
}

function encodeMSI(
  value: string,
  format: 'MSI' | 'MSI10' | 'MSI11' | 'MSI1010' | 'MSI1110',
): UPBarcodeEncoding {
  if (!/^\d+$/.test(value)) throw new Error(`${format} must contain only digits`);
  let normalized = value;
  if (format === 'MSI10') normalized += msiMod10(normalized);
  else if (format === 'MSI11') normalized += msiMod11(normalized);
  else if (format === 'MSI1010') {
    normalized += msiMod10(normalized);
    normalized += msiMod10(normalized);
  } else if (format === 'MSI1110') {
    normalized += msiMod11(normalized);
    normalized += msiMod10(normalized);
  }

  const payload = Array.from(normalized, (digit) =>
    Array.from(Number(digit).toString(2).padStart(4, '0'), (bit) =>
      bit === '0' ? '100' : '110',
    ).join(''),
  ).join('');
  return { binary: `110${payload}1001`, format, text: normalized };
}

function encodePharmacode(value: string): UPBarcodeEncoding {
  if (!/^\d+$/.test(value) || Number(value) < 3 || Number(value) > 131070) {
    throw new Error('pharmacode must be between 3 and 131070');
  }
  let number = Number(value);
  let binary = '';
  while (number !== 0) {
    if (number % 2 === 0) {
      binary = `11100${binary}`;
      number = (number - 2) / 2;
    } else {
      binary = `100${binary}`;
      number = (number - 1) / 2;
    }
  }
  return { binary: binary.slice(0, -2), format: 'pharmacode', text: value };
}

const CODABAR_PATTERNS: Record<string, string> = {
  '0': '101010011', '1': '101011001', '2': '101001011', '3': '110010101',
  '4': '101101001', '5': '110101001', '6': '100101011', '7': '100101101',
  '8': '100110101', '9': '110100101', '-': '101001101', '$': '101100101',
  ':': '1101011011', '/': '1101101011', '.': '1101101101', '+': '1011011011',
  A: '1011001001', B: '1001001011', C: '1010010011', D: '1010011001',
};

function encodeCodabar(value: string): UPBarcodeEncoding {
  const upper = value.toUpperCase();
  const normalized = /^[0-9\-$:.+/]+$/.test(upper) ? `A${upper}A` : upper;
  if (!/^[A-D][0-9\-$:.+/]+[A-D]$/.test(normalized)) {
    throw new Error('codabar requires A-D start/end characters and a valid payload');
  }
  return {
    binary: Array.from(normalized, (character) => CODABAR_PATTERNS[character]).join('0'),
    format: 'codabar',
    text: normalized.slice(1, -1),
  };
}
```

In the dispatch switch, call `encodeUPCA(text, format)` for both `UPC` and `UPCA` so the returned `format` preserves the requested alias. These functions cover every value in `UPBarcodeFormat`; do not silently redirect unsupported or invalid input to CODE128.

- [ ] **Step 4: Implement `UPBarcode` rendering**

Create `src/components/barcode/UPBarcode.tsx` with these public types:

```ts
export type UPBarcodeResult = {
  canvasId: string;
  format: Exclude<UPBarcodeFormat, 'auto'>;
  tempFilePath: string | null;
  text: string;
};

export type UPBarcodeRef = {
  render: () => Promise<UPBarcodeResult>;
  toTempFilePath: () => Promise<UPCanvasExportResult>;
};

export type UPBarcodeProps = {
  value?: string | number;
  format?: UPBarcodeFormat;
  width?: number | string;
  height?: number | string;
  displayValue?: boolean;
  text?: string;
  fontOptions?: string;
  font?: string;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'top' | 'bottom';
  textMargin?: number | string;
  fontSize?: number | string;
  background?: string;
  lineColor?: string;
  margin?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  useCanvas?: boolean;
  canvasId?: string;
  customStyle?: StyleProp<ViewStyle>;
  canvasAdapter?: UPCanvasAdapterComponent;
  onResult?: (result: UPBarcodeResult) => void;
  onError?: (error: Error) => void;
};
```

Use this drawing sequence:

```ts
type RequiredBarcodeProps = {
  background: string;
  displayValue: boolean;
  font: string;
  fontOptions: string;
  fontSize: number | string;
  height: number | string;
  lineColor: string;
  margin: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  marginTop?: number | string;
  text?: string;
  textAlign: 'left' | 'center' | 'right';
  textMargin: number | string;
  textPosition: 'top' | 'bottom';
  width: number | string;
};

type NormalizedBarcodeOptions = {
  background: string;
  displayValue: boolean;
  font: string;
  fontOptions: string;
  fontSize: number;
  height: number;
  lineColor: string;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  text: string;
  textAlign: 'left' | 'center' | 'right';
  textMargin: number;
  textPosition: 'top' | 'bottom';
  width: number;
};

function normalizeBarcodeOptions(props: RequiredBarcodeProps): NormalizedBarcodeOptions {
  const margin = getPx(props.margin);
  return {
    background: props.background,
    displayValue: props.displayValue,
    font: props.font,
    fontOptions: props.fontOptions,
    fontSize: getPx(props.fontSize),
    height: getPx(props.height),
    lineColor: props.lineColor,
    marginBottom: props.marginBottom === undefined ? margin : getPx(props.marginBottom),
    marginLeft: props.marginLeft === undefined ? margin : getPx(props.marginLeft),
    marginRight: props.marginRight === undefined ? margin : getPx(props.marginRight),
    marginTop: props.marginTop === undefined ? margin : getPx(props.marginTop),
    text: props.text ?? '',
    textAlign: props.textAlign,
    textMargin: getPx(props.textMargin),
    textPosition: props.textPosition,
    width: getPx(props.width),
  };
}

function getBarcodeCanvasSize(options: NormalizedBarcodeOptions) {
  const textHeight = options.displayValue ? options.fontSize + options.textMargin : 0;
  return {
    canvasHeight:
      options.height + options.marginTop + options.marginBottom + textHeight,
    canvasWidth: options.width + options.marginLeft + options.marginRight,
    textHeight,
  };
}

async function drawBarcode(canvas: UPCanvasRef, encoding: UPBarcodeEncoding, options: NormalizedBarcodeOptions) {
  const { canvasHeight, canvasWidth, textHeight } = getBarcodeCanvasSize(options);
  const contentWidth = options.width;
  const contentHeight = options.height;
  const barY = options.marginTop + (options.displayValue && options.textPosition === 'top' ? textHeight : 0);
  const moduleWidth = contentWidth / encoding.binary.length;

  await canvas.setFillStyle(options.background);
  await canvas.fillRect(0, 0, canvasWidth, canvasHeight);
  await canvas.setFillStyle(options.lineColor);

  for (let index = 0; index < encoding.binary.length;) {
    if (encoding.binary[index] !== '1') {
      index += 1;
      continue;
    }
    const start = index;
    while (index < encoding.binary.length && encoding.binary[index] === '1') {
      index += 1;
    }
    await canvas.fillRect(
      options.marginLeft + start * moduleWidth,
      barY,
      Math.max(1, (index - start) * moduleWidth),
      contentHeight,
    );
  }

  if (options.displayValue) {
    const label = options.text || encoding.text;
    const x = options.textAlign === 'left'
      ? options.marginLeft
      : options.textAlign === 'right'
        ? canvasWidth - options.marginRight
        : canvasWidth / 2;
    const y = options.textPosition === 'top'
      ? options.marginTop + options.fontSize
      : barY + contentHeight + options.textMargin + options.fontSize;
    await canvas.setFillStyle(options.lineColor);
    await canvas.setFont(
      [options.fontOptions, `${options.fontSize}px`, options.font]
        .filter(Boolean)
        .join(' '),
    );
    await canvas.setTextAlign(options.textAlign);
    await canvas.fillText(label, x, y);
  }

  await canvas.draw();
  return { canvasHeight, canvasWidth };
}
```

Implement rendering, export mode, and recoverable error UI with this state flow:

```ts
type ResolvedBarcodeProps = UPBarcodeProps &
  RequiredBarcodeProps & {
    format: UPBarcodeFormat;
    useCanvas: boolean;
    value: string | number;
  };

const props = {
  ...useUPConfig().props.barcode,
  ...input,
} as ResolvedBarcodeProps;
const canvasRef = useRef<UPCanvasRef>(null);
const resultRef = useRef<UPBarcodeResult | null>(null);
const generatedCanvasIdRef = useRef(
  `up-barcode-${Math.random().toString(36).slice(2, 11)}`,
);
const canvasId = props.canvasId ?? generatedCanvasIdRef.current;
const [canvasReady, setCanvasReady] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [imagePath, setImagePath] = useState('');
const reportedErrorsRef = useRef(new WeakSet<Error>());
const reportError = useCallback((caught: unknown) => {
  const normalized = caught instanceof Error ? caught : new Error(String(caught));
  if (!reportedErrorsRef.current.has(normalized)) {
    reportedErrorsRef.current.add(normalized);
    props.onError?.(normalized);
  }
  return normalized;
}, [props.onError]);
const options = useMemo(() => normalizeBarcodeOptions(props), [
  props.background,
  props.displayValue,
  props.font,
  props.fontOptions,
  props.fontSize,
  props.height,
  props.lineColor,
  props.margin,
  props.marginBottom,
  props.marginLeft,
  props.marginRight,
  props.marginTop,
  props.text,
  props.textAlign,
  props.textMargin,
  props.textPosition,
  props.width,
]);
const { canvasHeight, canvasWidth } = getBarcodeCanvasSize(options);

const exportCanvas = useCallback(async () => {
  const exported = await canvasRef.current?.toTempFilePath();
  if (!exported) throw new Error('Barcode canvas is not ready');
  setImagePath(exported.tempFilePath);
  if (resultRef.current) {
    resultRef.current = {
      ...resultRef.current,
      tempFilePath: exported.tempFilePath,
    };
  }
  return exported;
}, []);

const toTempFilePath = useCallback(async () => {
  try {
    return await exportCanvas();
  } catch (caught) {
    const normalized = reportError(caught);
    setError(normalized);
    throw normalized;
  }
}, [exportCanvas, reportError]);

const renderBarcode = useCallback(async () => {
  const canvas = canvasRef.current;
  if (!canvas) throw reportError(new Error('Barcode canvas is not ready'));
  setError(null);
  setImagePath('');
  try {
    const encoding = encodeBarcode(props.value, props.format);
    await drawBarcode(canvas, encoding, options);
    let tempFilePath: string | null = null;
    if (!props.useCanvas) {
      const exported = await exportCanvas();
      tempFilePath = exported.tempFilePath;
    }
    const result: UPBarcodeResult = {
      canvasId,
      format: encoding.format,
      tempFilePath,
      text: encoding.text,
    };
    resultRef.current = result;
    props.onResult?.(result);
    return result;
  } catch (caught) {
    const normalized = reportError(caught);
    setError(normalized);
    throw normalized;
  }
}, [
  canvasId,
  exportCanvas,
  options,
  props.format,
  props.onResult,
  props.useCanvas,
  props.value,
  reportError,
]);

useEffect(() => {
  if (canvasReady) void renderBarcode().catch(() => undefined);
}, [canvasReady, renderBarcode]);
```

Import `Image`, `Text`, and `View` from React Native. Define `const handleCanvasReady = useCallback(() => setCanvasReady(true), [])`. Render the canvas for both modes; hide it visually rather than replacing it so export remains possible. Never render bars as React Native nodes:

```tsx
<View
  style={[{ height: canvasHeight, width: canvasWidth }, props.customStyle]}
  testID="up-barcode"
>
  <UPCanvas
    bgColor={options.background}
    canvasAdapter={props.canvasAdapter}
    canvasId={canvasId}
    customStyle={
      props.useCanvas
        ? undefined
        : { height: canvasHeight, opacity: 0, position: 'absolute', width: canvasWidth }
    }
    height={canvasHeight}
    onError={reportError}
    onReady={handleCanvasReady}
    ref={canvasRef}
    width={canvasWidth}
  />
  {!props.useCanvas && imagePath ? (
    <Image
      resizeMode="contain"
      source={{ uri: imagePath }}
      style={{ height: canvasHeight, width: canvasWidth }}
      testID="up-barcode-image"
    />
  ) : null}
  {error ? (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: options.background,
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      <Text style={{ color: '#fa3534', fontSize: 12 }} testID="up-barcode-error">
        {error.message}
      </Text>
    </View>
  ) : null}
</View>
```

Expose `render` and `toTempFilePath` through `useImperativeHandle`. When `useCanvas=false`, draw first and export second; unsupported export must reject with `Canvas export is not supported`, call `onError`, and leave the error overlay visible.

- [ ] **Step 5: Add barcode defaults and exports**

Modify `src/config/defaults.ts`:

```ts
export type UPBarcodeDefaults = {
  value: string;
  format: string;
  width: number;
  height: number;
  displayValue: boolean;
  text?: string;
  fontOptions: string;
  font: string;
  textAlign: 'left' | 'center' | 'right';
  textPosition: 'top' | 'bottom';
  textMargin: number;
  fontSize: number;
  background: string;
  lineColor: string;
  margin: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  useCanvas: boolean;
};

barcode: Object.freeze({
  background: '#ffffff',
  displayValue: true,
  font: 'monospace',
  fontOptions: '',
  fontSize: 14,
  format: 'auto',
  height: 80,
  lineColor: '#000000',
  margin: 10,
  marginBottom: undefined,
  marginLeft: undefined,
  marginRight: undefined,
  marginTop: undefined,
  text: undefined,
  textAlign: 'center',
  textMargin: 2,
  textPosition: 'bottom',
  useCanvas: true,
  value: '',
  width: 200,
}),
```

Modify `src/config/store.ts` in the three existing config sections:

```ts
barcode?: Partial<UPProps['barcode']>;
barcode: { ...sourceDefaults.props.barcode },
barcode: { ...state.props.barcode, ...overrides.props?.barcode },
```

Create `src/components/barcode/index.ts`:

```ts
export * from './UPBarcode';
export * from './barcodeEncoder';
```

- [ ] **Step 6: Run barcode tests and typecheck**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPBarcode.test.tsx
npm run typecheck
```

Expected: PASS.

---

### Task 5: Public Exports, Docs, Examples, And Full Validation

**Files:**
- Modify: `src/components/index.ts`
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Test: full project validation commands

**Interfaces:**
- Consumes: public components from Tasks 2 through 4.
- Produces: package barrel exports and user-facing documentation for runtime dependency and adapter limits.

- [ ] **Step 1: Add public component exports**

Modify `src/components/index.ts` near the existing P28 exports:

```ts
export * from './canvas';
export * from './qrcode';
export * from './barcode';
```

- [ ] **Step 2: Add example usage**

Modify `example/App.tsx` by importing and rendering the new components in the component showcase:

```tsx
import { UPBarcode, UPCanvas, UPQrcode } from 'ultra-ui-rn';

<UPCanvas canvasId="demo-canvas" width={160} height={80} bgColor="#f5f7fa" />
<UPQrcode val="https://uview-plus.jiangruyi.com" size={140} />
<UPBarcode value="ABC123456" width={220} height={80} />
```

Keep the example compact and do not add independent TypeScript configuration for `example/`.

- [ ] **Step 3: Update compatibility documentation**

Modify `docs/compatibility.md` with these factual notes:

```md
### P29 Canvas And Code Images

- `UPCanvas` maps uview-plus `u-canvas` to a React Native adapter contract.
- The bundled default adapter uses `react-native-canvas`, which is WebView-backed through `react-native-webview`.
- `UPQrcode` and `UPBarcode` render through `UPCanvas`; they do not create large React Native `View` grids.
- Export, preview, and save flows depend on adapter/platform support. Unsupported export calls reject and call `onError`.
- Consumers can replace the renderer with `canvasAdapter` on `UPCanvas` or through `UP.setConfig({ props: { canvas: { canvasAdapter } } })`.
- `useRootHeightAndWidth` waits for a non-zero React Native layout before mounting the adapter; the parent must provide constrained width and height.
```

- [ ] **Step 4: Update gap matrix**

Modify `docs/gap-matrix.md` so `u-canvas`, `u-qrcode`, and `u-barcode` are marked implemented in React Native P29 with notes:

```md
| u-canvas | `UPCanvas` | P29 | Default `react-native-canvas` adapter, custom adapter supported |
| u-qrcode | `UPQrcode` | P29 | Canvas renderer, export depends on adapter |
| u-barcode | `UPBarcode` | P29 | Canvas renderer, `useCanvas=false` requires export support |
```

- [ ] **Step 5: Run focused component tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPCanvas.test.tsx tests/components/UPQrcode.test.tsx tests/components/UPBarcode.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Verify there is no React Native node-grid renderer**

Run:

```powershell
$matches = rg -n "matrix\\.modules.*<View|encoding\\.binary.*<View|Array\\.from\\([^\\r\\n]*(matrix|binary)" src/components/qrcode src/components/barcode
if ($LASTEXITCODE -eq 0) { $matches; throw 'View-grid fallback detected' }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
```

Expected: no matches. `View`, `Pressable`, loading overlays, error overlays, and exported `Image` wrappers are allowed; one native node per QR module or barcode bit is not.

- [ ] **Step 7: Run full validation**

Run:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
git status --short
```

Expected:

```text
npm test: PASS
npm run typecheck: PASS
npm run lint: PASS
npm run build: PASS
npm pack --dry-run: PASS
git diff --check: no whitespace errors
git status --short: shows only expected modified and untracked files from this worktree
```

- [ ] **Step 8: Handoff summary**

Report:

```text
- Added `UPCanvas`, `UPQrcode`, and `UPBarcode`.
- Added runtime dependencies `react-native-canvas` and `react-native-webview`.
- Updated exports, defaults, docs, examples, and tests.
- Validation results: npm test, typecheck, lint, build, pack dry-run, diff check.
- No git staging or commits were performed.
```
