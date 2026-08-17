import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { UP, UPRoot, UPTabbar, UPTabbarItem } from '../../src';

function renderTabbar(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits change before click for a non-active controlled item', () => {
  const events: string[] = [];
  const screen = renderTabbar(
    <UPTabbar
      onChange={(name) => events.push(`change:${String(name)}`)}
      onClick={(name) => events.push(`click:${String(name)}`)}
      value="home"
    >
      <UPTabbarItem icon="home" name="home" text="Home" />
      <UPTabbarItem icon="star" name="favorites" text="Favorites" />
    </UPTabbar>,
  );

  fireEvent.press(screen.getByTestId('up-tabbar-item-1'));
  expect(events).toEqual(['change:favorites', 'click:favorites']);
});

it('keeps controlled values unchanged and only emits click for active items', () => {
  const events: string[] = [];
  const screen = renderTabbar(
    <UPTabbar
      onChange={(name) => events.push(`change:${String(name)}`)}
      onClick={(name) => events.push(`click:${String(name)}`)}
      value="home"
    >
      <UPTabbarItem name="home" text="Home" />
      <UPTabbarItem name="favorites" text="Favorites" />
    </UPTabbar>,
  );

  fireEvent.press(screen.getByTestId('up-tabbar-item-0'));
  fireEvent.press(screen.getByTestId('up-tabbar-item-1'));

  expect(events).toEqual(['click:home', 'change:favorites', 'click:favorites']);
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-content').props.style)).toEqual(
    expect.objectContaining({ bottom: 0, left: 0, position: 'absolute', right: 0 }),
  );
  expect(screen.getByTestId('up-tabbar-placeholder')).toBeTruthy();
});

it('updates an uncontrolled value and uses child index when name is absent', () => {
  const screen = renderTabbar(
    <UPTabbar defaultValue={0} fixed={false}>
      <UPTabbarItem text="Home" />
      <UPTabbarItem text="Favorites" />
    </UPTabbar>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-0').props.style)).toEqual(
    expect.objectContaining({ color: '#1989fa' }),
  );
  fireEvent.press(screen.getByTestId('up-tabbar-item-1'));
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-1').props.style)).toEqual(
    expect.objectContaining({ color: '#1989fa' }),
  );
  expect(screen.queryByTestId('up-tabbar-placeholder')).toBeNull();
});

it('resolves icon nodes, badge precedence, and text nodes', () => {
  const screen = renderTabbar(
    <UPTabbar fixed={false} value="active">
      <UPTabbarItem
        activeIconNode={<Text>Active node</Text>}
        badge={12}
        dot
        inactiveIconNode={<Text>Inactive node</Text>}
        name="active"
        text="Home"
        textNode={<Text>Custom text</Text>}
      />
      <UPTabbarItem inactiveIconNode={<Text>Other inactive</Text>} name="other" text="Other" />
    </UPTabbar>,
  );

  expect(screen.getByText('Active node')).toBeTruthy();
  expect(screen.getByText('Custom text')).toBeTruthy();
  expect(screen.getByTestId('up-tabbar-badge-0')).toBeTruthy();
  expect(screen.queryByText('12')).toBeNull();
  expect(screen.getByText('Other inactive')).toBeTruthy();
});

it('maps indicators, text mode, transforms, and mid button treatment', () => {
  const screen = renderTabbar(
    <UPTabbar
      activeBackgroundColor="#dbeafe"
      animationType="lift"
      fixed={false}
      itemShape="round"
      styleType="underline"
      textMode="active"
      value="home"
    >
      <UPTabbarItem icon="home" name="home" text="Home" />
      <UPTabbarItem icon="star" name="favorites" text="Favorites" />
      <UPTabbarItem icon="plus" mode="midButton" name="create" text="Create" />
    </UPTabbar>,
  );

  expect(screen.getByTestId('up-tabbar-indicator-0')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-icon-0').props.style)).toEqual(
    expect.objectContaining({ transform: expect.any(Array) }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-1').props.style)).toEqual(
    expect.objectContaining({ opacity: 0.68 }),
  );
  expect(screen.getByTestId('up-tabbar-mid-button-2')).toBeTruthy();
});

it('reacts to configured defaults while explicit values take precedence', () => {
  const screen = renderTabbar(
    <UPTabbar activeColor="#00aa00" value="home"><UPTabbarItem name="home" text="Home" /></UPTabbar>,
  );

  act(() => {
    UP.setConfig({ props: { tabbar: { activeColor: '#ff0000', border: false } } });
  });

  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-text-0').props.style)).toEqual(
    expect.objectContaining({ color: '#00aa00' }),
  );
  fireEvent(screen.getByTestId('up-tabbar-content'), 'layout', {
    nativeEvent: { layout: { height: 76, width: 320, x: 0, y: 0 } },
  });
  expect(StyleSheet.flatten(screen.getByTestId('up-tabbar-placeholder').props.style)).toEqual(
    expect.objectContaining({ height: 76 }),
  );
});
