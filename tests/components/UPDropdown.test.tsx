import React, { createRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UP,
  UPDropdown,
  UPDropdownItem,
  UPRoot,
  type UPDropdownRef,
} from '../../src';

const deliveryOptions = [
  { label: 'Standard', value: 'standard' },
  { label: 'Express', value: 'express' },
] as const;

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders item titles and opens default options', async () => {
  const screen = renderRoot(
    <UPDropdown>
      <UPDropdownItem options={deliveryOptions} title="Delivery" />
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(screen.getByTestId('up-dropdown-panel')).toBeTruthy();
  expect(screen.getByText('Standard')).toBeTruthy();
});

it('switches enabled menus, ignores disabled menus, and applies self-close policy', async () => {
  const onOpen = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPDropdown onClose={onClose} onOpen={onOpen}>
      <UPDropdownItem title="One"><Text>One panel</Text></UPDropdownItem>
      <UPDropdownItem disabled title="Two"><Text>Two panel</Text></UPDropdownItem>
      <UPDropdownItem title="Three"><Text>Three panel</Text></UPDropdownItem>
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(screen.getByText('One panel')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-dropdown-menu-1'));
  expect(screen.getByText('One panel')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-dropdown-menu-2'));
  expect(screen.getByText('Three panel')).toBeTruthy();
  expect(onOpen).toHaveBeenNthCalledWith(1, 0);
  expect(onOpen).toHaveBeenLastCalledWith(2);
  fireEvent.press(screen.getByTestId('up-dropdown-menu-2'));
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
  expect(onClose).toHaveBeenLastCalledWith(2);

  const persistent = renderRoot(
    <UPDropdown closeOnClickSelf={false}>
      <UPDropdownItem title="Persistent"><Text>Persistent panel</Text></UPDropdownItem>
    </UPDropdown>,
  );
  await waitFor(() => expect(persistent.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(persistent.getByTestId('up-dropdown-menu-0'));
  fireEvent.press(persistent.getByTestId('up-dropdown-menu-0'));
  expect(persistent.getByText('Persistent panel')).toBeTruthy();
});

it('updates default options before closing and honors both mask policies', async () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPDropdown>
      <UPDropdownItem
        closeOnClickOverlay={false}
        onChange={(value) => events.push(`change:${String(value)}`)}
        onUpdateModelValue={(value) => events.push(`update:${String(value)}`)}
        options={deliveryOptions}
        title="Delivery"
      />
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  fireEvent.press(screen.getByTestId('up-dropdown-mask'));
  expect(screen.getByTestId('up-dropdown-panel')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-dropdown-option-0-1'));
  expect(events).toEqual(['update:express', 'change:express']);
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();

  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(StyleSheet.flatten(screen.getByText('Express').props.style)).toEqual(
    expect.objectContaining({ color: '#2979ff' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-options-0').props.style)).toEqual(
    expect.objectContaining({ maxHeight: undefined }),
  );
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));

  screen.rerender(
    <UPRoot>
      <UPDropdown key="mask-close">
        <UPDropdownItem options={deliveryOptions} title="Delivery" />
      </UPDropdown>
    </UPRoot>,
  );
  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(screen.getByTestId('up-dropdown-panel')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-dropdown-mask'));
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});

it('applies item scroll height and keeps the menu bar outside its root mask', async () => {
  const screen = renderRoot(
    <UPDropdown>
      <UPDropdownItem height={120} options={deliveryOptions} title="Sized" />
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-options-0').props.style)).toEqual(
    expect.objectContaining({ maxHeight: 120 }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-mask').props.style)).toEqual(
    expect.objectContaining({ top: expect.any(Number) }),
  );
});

it('supports controlled zero, ref methods, and visual-only highlight', async () => {
  const ref = createRef<UPDropdownRef>();
  const screen = renderRoot(
    <UPDropdown ref={ref}>
      <UPDropdownItem modelValue={0} options={[{ label: 'Zero', value: 0 }]} title="One" />
      <UPDropdownItem title="Two"><Text>Two panel</Text></UPDropdownItem>
      <UPDropdownItem disabled title="Three"><Text>Three panel</Text></UPDropdownItem>
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  act(() => ref.current?.highlight([1]));
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-title-1').props.style)).toEqual(
    expect.objectContaining({ color: '#2979ff' }),
  );
  act(() => ref.current?.open(2));
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
  act(() => ref.current?.open(0));
  expect(screen.getByText('Zero')).toBeTruthy();
  act(() => ref.current?.close());
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});

it('replaces default options with application-owned custom children', async () => {
  const ref = createRef<UPDropdownRef>();
  const screen = renderRoot(
    <UPDropdown ref={ref}>
      <UPDropdownItem options={deliveryOptions} title="Custom">
        <Text>Custom controls own their state</Text>
      </UPDropdownItem>
    </UPDropdown>,
  );

  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(screen.getByText('Custom controls own their state')).toBeTruthy();
  expect(screen.queryByTestId('up-dropdown-option-0-0')).toBeNull();
  act(() => ref.current?.close());
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});

it('reacts to configured defaults while explicit values win', async () => {
  const screen = renderRoot(<UPDropdown activeColor="#00aa00"><UPDropdownItem title="Configured" /></UPDropdown>);
  act(() => {
    UP.setConfig({ props: { dropdown: { activeColor: '#ff0000', borderBottom: true } } });
  });
  await waitFor(() => expect(screen.getByTestId('up-dropdown-menu-0')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-dropdown-menu-0'));
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-title-0').props.style)).toEqual(
    expect.objectContaining({ color: '#00aa00' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-dropdown-icon-0').props.style)).toEqual(
    expect.objectContaining({ transform: [{ rotate: '180deg' }] }),
  );
  fireEvent.press(screen.getByTestId('up-dropdown-mask'));
  expect(screen.queryByTestId('up-dropdown-panel')).toBeNull();
});
