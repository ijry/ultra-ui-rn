import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPCateTab, UPRoot } from '../../src';

const data = [
  {
    name: '手机',
    children: [
      { name: 'iPhone', icon: 'https://example.test/iphone.png' },
      { name: 'Android' },
    ],
  },
  { name: '电脑', children: [{ name: 'Mac' }, { name: 'Windows' }] },
  { name: '配件', children: [{ name: '键盘' }] },
];

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function layoutSections(screen: ReturnType<typeof renderRoot>) {
  fireEvent(screen.getByTestId('up-cate-tab-menu-item-0'), 'layout', {
    nativeEvent: { layout: { height: 48, width: 96, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-cate-tab-section-0'), 'layout', {
    nativeEvent: { layout: { height: 200, width: 224, x: 0, y: 0 } },
  });
  fireEvent(screen.getByTestId('up-cate-tab-section-1'), 'layout', {
    nativeEvent: { layout: { height: 200, width: 224, x: 0, y: 200 } },
  });
  fireEvent(screen.getByTestId('up-cate-tab-section-2'), 'layout', {
    nativeEvent: { layout: { height: 200, width: 224, x: 0, y: 400 } },
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

it('renders source-style left tabs and default right item grid', () => {
  const screen = renderRoot(<UPCateTab tabList={data} />);

  expect(screen.getAllByText('手机')).toHaveLength(2);
  expect(screen.getByText('iPhone')).toBeTruthy();
  expect(screen.getByText('Windows')).toBeTruthy();
  expect(screen.getByTestId('up-cate-tab-page-item-0-0')).toBeTruthy();
});

it('updates uncontrolled current from left menu presses and suppresses duplicate changes', () => {
  const onChange = jest.fn();
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(
    <UPCateTab onChange={onChange} onUpdateCurrent={onUpdateCurrent} tabList={data} />,
  );
  const scrollTo = jest.spyOn(screen.UNSAFE_getAllByType(ScrollView)[1].instance, 'scrollTo');
  layoutSections(screen);

  fireEvent.press(screen.getByTestId('up-cate-tab-menu-item-1'));
  fireEvent.press(screen.getByTestId('up-cate-tab-menu-item-1'));

  expect(onUpdateCurrent).toHaveBeenCalledTimes(1);
  expect(onUpdateCurrent).toHaveBeenCalledWith(1);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(1, data[1]);
  expect(scrollTo).toHaveBeenCalledWith({ animated: true, y: 200 });
});

it('keeps controlled current visually selected and clamps stale indexes', () => {
  const screen = renderRoot(<UPCateTab current={99} tabList={data} />);

  expect(screen.getByTestId('up-cate-tab-menu-item-2').props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );

  screen.rerender(<UPRoot><UPCateTab current={1} tabList={data.slice(0, 1)} /></UPRoot>);
  expect(screen.getByTestId('up-cate-tab-menu-item-0').props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );
});

it('syncs follow mode from measured right-side scroll positions', () => {
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(<UPCateTab onUpdateCurrent={onUpdateCurrent} tabList={data} />);
  layoutSections(screen);

  fireEvent.scroll(screen.getByTestId('up-cate-tab-right-scroll'), {
    nativeEvent: { contentOffset: { x: 0, y: 250 } },
  });

  expect(onUpdateCurrent).toHaveBeenCalledWith(1);
  expect(screen.getByTestId('up-cate-tab-menu-item-1').props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );
});

it('renders only the active section in tab mode', () => {
  const screen = renderRoot(<UPCateTab current={1} mode="tab" tabList={data} />);

  expect(screen.queryByTestId('up-cate-tab-section-0')).toBeNull();
  expect(screen.getByTestId('up-cate-tab-section-1')).toBeTruthy();
  expect(screen.queryByTestId('up-cate-tab-section-2')).toBeNull();
});

it('maps render props and custom key names', () => {
  const custom = [{ title: '一级', children: [{ title: '二级' }] }];
  const screen = renderRoot(
    <UPCateTab
      itemKeyName="title"
      renderPageItem={({ item }) => <Text>page:{String(item.title)}</Text>}
      renderRightTop={() => <Text>right top</Text>}
      renderTabItem={({ item, active }) => (
        <Text>{active ? `active:${String(item.title)}` : String(item.title)}</Text>
      )}
      tabKeyName="title"
      tabList={custom}
    />,
  );

  expect(screen.getByText('active:一级')).toBeTruthy();
  expect(screen.getByText('right top')).toBeTruthy();
  expect(screen.getByText('page:二级')).toBeTruthy();
});

it('reacts to configured defaults while explicit props win', () => {
  const screen = renderRoot(<UPCateTab current={1} mode="tab" tabList={data} />);

  act(() => {
    UP.setConfig({ props: { cateTab: { current: 2, height: '360px', mode: 'follow' } } });
  });

  expect(screen.queryByTestId('up-cate-tab-section-0')).toBeNull();
  expect(StyleSheet.flatten(screen.getByTestId('up-cate-tab').props.style)).toEqual(
    expect.objectContaining({ height: 360 }),
  );
});
