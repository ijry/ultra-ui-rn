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
