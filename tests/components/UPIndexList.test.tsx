import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import {
  UP,
  UPIndexAnchor,
  UPIndexItem,
  UPIndexList,
  UPRoot,
  type UPIndexValue,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function Groups() {
  return (
    <>
      <UPIndexItem><UPIndexAnchor text="A" /><Text>Alpha</Text></UPIndexItem>
      <UPIndexItem><UPIndexAnchor text="B" /><Text>Beta</Text></UPIndexItem>
      <UPIndexItem><UPIndexAnchor text="C" /><Text>Charlie</Text></UPIndexItem>
    </>
  );
}

function railHandlers(screen: ReturnType<typeof renderRoot>) {
  return screen.getByTestId('up-index-rail').props;
}

function responderEvent(
  locationY: number,
  timestamp: number,
  previousPageY = locationY,
  currentPageY = locationY,
  previousPageX = 0,
  currentPageX = 0,
) {
  return {
    nativeEvent: { locationY },
    touchHistory: {
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: timestamp,
      numberActiveTouches: 1,
      touchBank: [{
        currentPageX,
        currentPageY,
        currentTimeStamp: timestamp,
        previousPageX,
        previousPageY,
        touchActive: true,
      }],
    },
  };
}

function registerGroups(screen: ReturnType<typeof renderRoot>) {
  fireEvent(screen.getByTestId('up-index-item-A'), 'layout', {
    nativeEvent: { layout: { height: 100, width: 320, x: 0, y: 100 } },
  });
  fireEvent(screen.getByTestId('up-index-item-B'), 'layout', {
    nativeEvent: { layout: { height: 100, width: 320, x: 0, y: 300 } },
  });
  fireEvent(screen.getByTestId('up-index-item-C'), 'layout', {
    nativeEvent: { layout: { height: 100, width: 320, x: 0, y: 500 } },
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

it('renders default A-Z and custom primitive/object source rails', () => {
  const defaultRail = renderRoot(<UPIndexList><Groups /></UPIndexList>);
  expect(defaultRail.getByTestId('up-index-rail-0')).toBeTruthy();
  expect(defaultRail.getByTestId('up-index-rail-25')).toBeTruthy();
  expect(defaultRail.getByTestId('up-index-rail-text-0').props.children).toBe('A');
  expect(defaultRail.getByTestId('up-index-rail-text-25').props.children).toBe('Z');

  const customRail = renderRoot(
    <UPIndexList indexList={['A', { key: 'B', name: 'Beta' }, 3]}><Groups /></UPIndexList>,
  );
  expect(customRail.getByTestId('up-index-rail-0')).toBeTruthy();
  expect(customRail.getByTestId('up-index-rail-1')).toBeTruthy();
  expect(customRail.getByTestId('up-index-rail-2')).toBeTruthy();
  expect(customRail.queryByTestId('up-index-rail-3')).toBeNull();
  expect(customRail.getByTestId('up-index-rail-text-0').props.children).toBe('A');
  expect(customRail.getByTestId('up-index-rail-text-1').props.children).toBe('B');
  expect(customRail.getByTestId('up-index-rail-text-2').props.children).toBe('3');
});

it('maps source active and inactive rail colors with explicit overrides', () => {
  const screen = renderRoot(
    <UPIndexList activeColor="#123456" inactiveColor="#654321" indexList={['A', 'B']}>
      <Groups />
    </UPIndexList>,
  );
  registerGroups(screen);

  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: 'transparent' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-text-1').props.style)).toEqual(
    expect.objectContaining({ color: '#654321' }),
  );

  fireEvent.press(screen.getByTestId('up-index-rail-1'));
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#123456' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-text-1').props.style)).toEqual(
    expect.objectContaining({ color: '#ffffff' }),
  );
});

it('maps source anchor styles, children replacement, and sticky input', () => {
  const screen = renderRoot(
    <UPIndexList>
      <UPIndexItem>
        <UPIndexAnchor
          bgColor="#eeeeee"
          color="#112233"
          height={40}
          size={18}
          sticky={false}
        >
          <Text>Custom header</Text>
        </UPIndexAnchor>
      </UPIndexItem>
    </UPIndexList>,
  );

  expect(screen.getByText('Custom header')).toBeTruthy();
  expect(screen.queryByTestId('up-index-anchor-text')).toBeNull();
  expect(StyleSheet.flatten(screen.getByTestId('up-index-anchor').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#eeeeee', height: 40, zIndex: 0 }),
  );

  const styled = renderRoot(
    <UPIndexList><UPIndexItem><UPIndexAnchor color="#112233" size={18} text="A" /></UPIndexItem></UPIndexList>,
  );
  expect(StyleSheet.flatten(styled.getByTestId('up-index-anchor-text').props.style)).toEqual(
    expect.objectContaining({ color: '#112233', fontSize: 18 }),
  );
});

it('jumps measured groups after subtracting source custom navigation height', () => {
  const screen = renderRoot(
    <UPIndexList customNavHeight={20} indexList={['A', 'B']}><Groups /></UPIndexList>,
  );
  registerGroups(screen);
  const scrollTo = jest.spyOn(screen.UNSAFE_getByType(ScrollView).instance, 'scrollTo');
  scrollTo.mockClear();

  fireEvent.press(screen.getByTestId('up-index-rail-1'));

  expect(scrollTo).toHaveBeenCalledWith({ animated: true, y: 280 });
});

it('captures vertical rail drags, clamps bounds, and skips duplicate selection', () => {
  const onSelect = jest.fn();
  const screen = renderRoot(
    <UPIndexList indexList={['A', 'B', 'C']} onSelect={onSelect}><Groups /></UPIndexList>,
  );
  registerGroups(screen);
  const scrollTo = jest.spyOn(screen.UNSAFE_getByType(ScrollView).instance, 'scrollTo');
  scrollTo.mockClear();
  const rail = railHandlers(screen);

  expect(rail.onMoveShouldSetResponderCapture(responderEvent(2, 1, 0, 2, 0, 3))).toBe(false);
  rail.onResponderRelease({});
  expect(rail.onMoveShouldSetResponderCapture(responderEvent(3, 2, 0, 3))).toBe(true);
  rail.onResponderRelease({});
  act(() => {
    rail.onResponderGrant(responderEvent(-10, 3));
    rail.onResponderMove(responderEvent(999, 4));
    rail.onResponderMove(responderEvent(999, 5));
    rail.onResponderRelease({});
  });

  expect(onSelect.mock.calls).toEqual([['A'], ['C']]);
  expect(scrollTo.mock.calls).toEqual([
    [{ animated: false, y: 100 }],
    [{ animated: false, y: 500 }],
  ]);
});

it('preserves source object identity and does not scroll missing drag targets', () => {
  const value: UPIndexValue = { key: 'ObjectB', name: 'Beta' };
  const missing: UPIndexValue = { key: 'Z', name: 'Zeta' };
  const onSelect = jest.fn();
  const screen = renderRoot(
    <UPIndexList indexList={['A', value, missing]} onSelect={onSelect}><Groups /></UPIndexList>,
  );
  registerGroups(screen);
  const scrollTo = jest.spyOn(screen.UNSAFE_getByType(ScrollView).instance, 'scrollTo');
  scrollTo.mockClear();
  const rail = railHandlers(screen);

  act(() => {
    rail.onResponderGrant(responderEvent(18, 1));
    rail.onResponderMove(responderEvent(36, 2));
    rail.onResponderTerminate({});
  });

  expect(onSelect.mock.calls[0][0]).toBe(value);
  expect(onSelect.mock.calls[1][0]).toBe(missing);
  expect(scrollTo).not.toHaveBeenCalled();
});

it('preserves object selection identity and selects missing groups without scrolling', () => {
  const value: UPIndexValue = { key: 'Z', name: 'Gamma' };
  const onSelect = jest.fn();
  const screen = renderRoot(
    <UPIndexList indexList={['A', value]} onSelect={onSelect}><Groups /></UPIndexList>,
  );
  registerGroups(screen);
  const scrollTo = jest.spyOn(screen.UNSAFE_getByType(ScrollView).instance, 'scrollTo');
  scrollTo.mockClear();

  fireEvent.press(screen.getByTestId('up-index-rail-1'));

  expect(onSelect).toHaveBeenCalledWith(value);
  expect(scrollTo).not.toHaveBeenCalled();
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#5677fc' }),
  );
});

it('derives active rail selection from native scroll positions', () => {
  const screen = renderRoot(
    <UPIndexList customNavHeight={20} indexList={['A', 'B']}><Groups /></UPIndexList>,
  );
  registerGroups(screen);

  fireEvent.scroll(screen.getByTestId('up-index-scroll'), {
    nativeEvent: { contentOffset: { x: 0, y: 0 } },
  });
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: 'transparent' }),
  );

  fireEvent.scroll(screen.getByTestId('up-index-scroll'), {
    nativeEvent: { contentOffset: { x: 0, y: 100 } },
  });
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#5677fc' }),
  );

  fireEvent.scroll(screen.getByTestId('up-index-scroll'), {
    nativeEvent: { contentOffset: { x: 0, y: 300 } },
  });
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#5677fc' }),
  );
});

it('does not replace active drag selection with scroll-derived state', () => {
  const screen = renderRoot(
    <UPIndexList indexList={['A', 'B', 'C']}><Groups /></UPIndexList>,
  );
  registerGroups(screen);
  const rail = railHandlers(screen);

  act(() => {
    rail.onResponderGrant(responderEvent(999, 1));
    fireEvent.scroll(screen.getByTestId('up-index-scroll'), {
      nativeEvent: { contentOffset: { x: 0, y: 100 } },
    });
  });
  expect(StyleSheet.flatten(screen.getByTestId('up-index-rail-2').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#5677fc' }),
  );
  act(() => rail.onResponderRelease({}));
});

it('maps item margin, no-op compatibility props, and reactive source defaults', () => {
  const screen = renderRoot(
    <UPIndexList customClass="source-class" itemMargin={12} safeBottomFix>
      <UPIndexItem><UPIndexAnchor text="A" /></UPIndexItem>
    </UPIndexList>,
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-index-item-A').props.style)).toEqual(
    expect.objectContaining({ marginBottom: 12 }),
  );

  act(() => {
    UP.setConfig({
      props: {
        indexAnchor: { bgColor: '#040506', height: 36 },
        indexList: { activeColor: '#010203', indexList: ['Q'] },
      },
    });
  });
  expect(screen.getByTestId('up-index-rail-0')).toBeTruthy();
  expect(screen.queryByTestId('up-index-rail-1')).toBeNull();
  expect(StyleSheet.flatten(screen.getByTestId('up-index-anchor').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#040506', height: 36 }),
  );

  screen.rerender(
    <UPRoot>
      <UPIndexList activeColor="#abcdef" indexList={['A', 'B']}>
        <UPIndexItem><UPIndexAnchor bgColor="#fedcba" text="A" /></UPIndexItem>
      </UPIndexList>
    </UPRoot>,
  );
  expect(screen.getByTestId('up-index-rail-1')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-index-anchor').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#fedcba' }),
  );
});
