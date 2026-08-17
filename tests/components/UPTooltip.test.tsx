import React, { createRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UP,
  UPPopover,
  UPTooltip,
  UPRoot,
  type UPPopoverRef,
  type UPTooltipRef,
  type UPTooltipWriteText,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  jest.restoreAllMocks();
});

it('opens on click, maps source action indexes, and closes through the transparent overlay', () => {
  const onClick = jest.fn();
  const onClose = jest.fn();
  const onUpdateShow = jest.fn();
  const screen = renderRoot(
    <UPTooltip
      buttons={['Archive']}
      onClick={onClick}
      onClose={onClose}
      onUpdateShow={onUpdateShow}
      showCopy={false}
      text="Actions"
      triggerMode="click"
    />,
  );

  fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
  expect(screen.getByTestId('up-tooltip-popup')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-tooltip-button-0'));
  expect(onClick).toHaveBeenCalledWith(0);
  expect(onUpdateShow).toHaveBeenCalledWith(false);

  fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
  fireEvent.press(screen.getByTestId('up-tooltip-overlay'));
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('opens through source longpress and synchronizes manual show state', () => {
  const onUpdateShow = jest.fn();
  const screen = renderRoot(<UPTooltip text="Hold me" triggerMode="longpress" />);

  fireEvent(screen.getByTestId('up-tooltip-trigger'), 'longPress');
  expect(screen.getByTestId('up-tooltip-popup')).toBeTruthy();

  screen.rerender(
    <UPRoot><UPTooltip onUpdateShow={onUpdateShow} show text="Manual" triggerMode="manual" /></UPRoot>,
  );
  expect(screen.getByTestId('up-tooltip-popup')).toBeTruthy();
  screen.rerender(
    <UPRoot><UPTooltip onUpdateShow={onUpdateShow} show={false} text="Manual" triggerMode="manual" /></UPRoot>,
  );
  expect(screen.queryByTestId('up-tooltip-popup')).toBeNull();
  expect(onUpdateShow).toHaveBeenCalledWith(false);
});

it('copies through the application adapter and preserves source copy/action indexes', async () => {
  const writeText: UPTooltipWriteText = jest.fn();
  const onClick = jest.fn();
  const screen = renderRoot(
    <UPTooltip
      buttons={['Archive']}
      copyText="invoice-7"
      onClick={onClick}
      text="Receipt"
      triggerMode="click"
      writeText={writeText}
    />,
  );

  fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
  fireEvent.press(screen.getByTestId('up-tooltip-copy'));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('invoice-7'));
  expect(onClick).toHaveBeenCalledWith(0);
  await waitFor(() => expect(screen.getByText('复制成功')).toBeTruthy());

  fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
  fireEvent.press(screen.getByTestId('up-tooltip-button-0'));
  expect(onClick).toHaveBeenLastCalledWith(1);
});

it('reports missing copy adapters and applies forced root-layer coordinates', async () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = renderRoot(
    <UPTooltip
      forcePosition={{ left: 23, top: 17 }}
      showCopy
      text="Receipt"
      triggerMode="click"
    />,
  );

  fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
  expect(StyleSheet.flatten(screen.getByTestId('up-tooltip-popup').props.style)).toEqual(
    expect.objectContaining({ left: 23, top: 17 }),
  );
  fireEvent.press(screen.getByTestId('up-tooltip-copy'));
  await waitFor(() => expect(screen.getByText('复制失败')).toBeTruthy());
  expect(warning).toHaveBeenCalledWith(expect.stringContaining('writeText'));
});

it('keeps only one active source singleton tooltip and supports imperative methods', () => {
  const firstClose = jest.fn();
  const ref = createRef<UPTooltipRef>();
  const screen = renderRoot(
    <>
      <UPTooltip onClose={firstClose} singleton text="First" triggerMode="click" />
      <UPTooltip ref={ref} singleton text="Second" triggerMode="click" />
    </>,
  );

  fireEvent.press(screen.getAllByTestId('up-tooltip-trigger')[0]);
  fireEvent.press(screen.getAllByTestId('up-tooltip-trigger')[1]);
  expect(firstClose).toHaveBeenCalledTimes(1);
  expect(screen.getAllByTestId('up-tooltip-popup')).toHaveLength(1);

  act(() => ref.current?.close());
  expect(screen.queryByTestId('up-tooltip-popup')).toBeNull();
  act(() => ref.current?.open());
  expect(screen.getByTestId('up-tooltip-popup')).toBeTruthy();
});

it('reacts to configured tooltip defaults while explicit props win', () => {
  const screen = renderRoot(<UPTooltip text="Configured trigger" triggerMode="click" />);

  act(() => {
    UP.setConfig({ props: { tooltip: { buttons: ['Configured action'], showCopy: false } } });
  });
  fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
  expect(screen.getByText('Configured action')).toBeTruthy();

  screen.rerender(
    <UPRoot><UPTooltip buttons={['Explicit action']} showCopy={false} text="Configured trigger" triggerMode="click" /></UPRoot>,
  );
  fireEvent.press(screen.getByTestId('up-tooltip-trigger'));
  expect(screen.getByText('Explicit action')).toBeTruthy();
});

it('maps popover trigger/content slots and forwards its imperative ref', () => {
  const ref = createRef<UPPopoverRef>();
  const onOpen = jest.fn();
  const screen = renderRoot(
    <UPPopover
      content={<Text>Popover body</Text>}
      onOpen={onOpen}
      ref={ref}
      trigger={<Text>Popover trigger</Text>}
    />,
  );

  fireEvent.press(screen.getByTestId('up-popover-trigger'));
  expect(screen.getByText('Popover body')).toBeTruthy();
  expect(onOpen).toHaveBeenCalledTimes(1);
  act(() => ref.current?.close());
  expect(screen.queryByTestId('up-tooltip-popup')).toBeNull();
  act(() => ref.current?.open());
  expect(screen.getByText('Popover body')).toBeTruthy();
});
