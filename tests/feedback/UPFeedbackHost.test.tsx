import React from 'react';
import { act, render } from '@testing-library/react-native';
import { UP, UPRoot } from '../../src';

it('shows a host-backed toast and closes after its source duration', () => {
  jest.useFakeTimers();
  const screen = render(<UPRoot />);

  act(() => {
    UP.toast.success('Saved');
  });
  expect(screen.getByText('Saved')).toBeTruthy();

  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(screen.queryByText('Saved')).toBeNull();
  jest.useRealTimers();
});

it('does not throw when imperative feedback has no mounted root', () => {
  expect(() => UP.notify.show({ message: 'Offline' })).not.toThrow();
});
