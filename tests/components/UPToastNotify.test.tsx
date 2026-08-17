import React from 'react';
import { act, render } from '@testing-library/react-native';
import { UPNotify, UPRoot, UPToast } from '../../src';

it('renders declarative toast loading and notify source colors', () => {
  const screen = render(
    <UPRoot>
      <UPToast loading message="Saving" show />
      <UPNotify bgColor="#111111" message="Offline" show />
    </UPRoot>,
  );

  expect(screen.getByText('Saving')).toBeTruthy();
  expect(screen.getByText('Offline')).toBeTruthy();
  expect(screen.getByTestId('up-notify').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ backgroundColor: '#111111' })]),
  );
});

it('requests declarative toast closure after duration', () => {
  jest.useFakeTimers();
  const onChangeShow = jest.fn();
  render(
    <UPRoot>
      <UPToast duration={100} message="Saved" onChangeShow={onChangeShow} show />
    </UPRoot>,
  );
  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(onChangeShow).toHaveBeenCalledWith(false);
  jest.useRealTimers();
});
