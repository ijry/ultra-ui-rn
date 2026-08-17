import React, { createRef } from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import {
  UPCircleProgress,
  UPCountDown,
  UPCountTo,
  UPLineProgress,
  UPLoadmore,
  UPRoot,
  type UPCountDownRef,
  type UPCountToRef,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('clamps source line progress, supports right origin, and shows percentage text', () => {
  const screen = renderRoot(<UPLineProgress fromRight percentage={150} />);
  expect(screen.getByText('100%')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-line-progress-active').props.style)).toEqual(
    expect.objectContaining({ right: 0, width: '100%' }),
  );
});

it('renders source circle percentage and loadmore loading or nomore states', () => {
  const onLoadmore = jest.fn();
  const screen = renderRoot(
    <>
      <UPCircleProgress percentage={42} />
      <UPLoadmore onLoadmore={onLoadmore} status="loadmore" />
      <UPLoadmore isDot status="nomore" />
    </>,
  );
  expect(screen.getByText('42%')).toBeTruthy();
  expect(screen.getByText('加载更多')).toBeTruthy();
  expect(screen.getByText('●')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-loadmore-loadmore'));
  expect(onLoadmore).toHaveBeenCalledTimes(1);
});

it('runs source countdown refs and emits formatted time data', () => {
  jest.useFakeTimers();
  const ref = createRef<UPCountDownRef>();
  const onChange = jest.fn();
  const onFinish = jest.fn();
  const screen = renderRoot(
    <UPCountDown ref={ref} format="ss:SSS" onChange={onChange} onFinish={onFinish} time={1100} />,
  );
  expect(screen.getByText('01:100')).toBeTruthy();
  act(() => jest.advanceTimersByTime(1000));
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ seconds: 0 }));
  ref.current?.pause();
  act(() => jest.advanceTimersByTime(500));
  expect(onFinish).not.toHaveBeenCalled();
  act(() => {
    ref.current?.reset();
  });
  expect(screen.getByText('01:100')).toBeTruthy();
  jest.useRealTimers();
});

it('animates source count-to values and exposes reset', () => {
  jest.useFakeTimers();
  const ref = createRef<UPCountToRef>();
  const onEnd = jest.fn();
  const screen = renderRoot(
    <UPCountTo ref={ref} duration={100} endVal={1234.5} onEnd={onEnd} separator="," decimals={1} />,
  );
  act(() => jest.advanceTimersByTime(120));
  expect(screen.getByText('1,234.5')).toBeTruthy();
  expect(onEnd).toHaveBeenCalledTimes(1);
  act(() => ref.current?.reset());
  expect(screen.getByText('0.0')).toBeTruthy();
  jest.useRealTimers();
});
