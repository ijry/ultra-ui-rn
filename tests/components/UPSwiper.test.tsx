import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot, UPSwiper, UPSwiperIndicator } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders source line and dot indicator states and reacts to global defaults', () => {
  const screen = renderRoot(<UPSwiperIndicator current={1} length={3} />);

  expect(StyleSheet.flatten(screen.getByTestId('up-swiper-indicator-line').props.style)).toEqual(
    expect.objectContaining({ width: 66 }),
  );

  screen.rerender(
    <UPRoot>
      <UPSwiperIndicator current={1} indicatorMode="dot" length={3} />
    </UPRoot>,
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-swiper-indicator-dot-1').props.style)).toEqual(
    expect.objectContaining({ width: 12 }),
  );

  act(() => {
    UP.setConfig({ props: { swiperIndicator: { indicatorActiveColor: '#123456' } } });
  });

  expect(StyleSheet.flatten(screen.getByTestId('up-swiper-indicator-dot-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#123456' }),
  );
});

it('maps source scroll changes, item presses, controlled updates, and autoplay', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  const onClick = jest.fn();
  const onUpdateCurrent = jest.fn();
  const screen = renderRoot(
    <UPSwiper
      autoplay
      circular
      current={0}
      indicator
      interval={100}
      list={['https://example.test/one.png', 'https://example.test/two.png']}
      onChange={onChange}
      onClick={onClick}
      onUpdateCurrent={onUpdateCurrent}
    />,
  );

  fireEvent.press(screen.getByTestId('up-swiper-item-1'));
  expect(onClick).toHaveBeenCalledWith(1);
  fireEvent(screen.getByTestId('up-swiper-scroll'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 320, y: 0 }, layoutMeasurement: { width: 320, height: 130 } },
  });
  expect(onChange).toHaveBeenCalledWith({ current: 1 });
  expect(onUpdateCurrent).toHaveBeenCalledWith(1);

  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(onChange).toHaveBeenLastCalledWith({ current: 0 });
  expect(onUpdateCurrent).toHaveBeenLastCalledWith(0);

  screen.rerender(
    <UPRoot>
      <UPSwiper
        autoplay={false}
        current={1}
        indicator
        list={['https://example.test/one.png', 'https://example.test/two.png']}
        onChange={onChange}
        onUpdateCurrent={onUpdateCurrent}
      />
    </UPRoot>,
  );
  expect(screen.getByTestId('up-swiper-indicator')).toBeTruthy();
  expect(onChange).toHaveBeenCalledTimes(2);
  jest.useRealTimers();
});
