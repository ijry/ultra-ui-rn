import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UPOverlay, UPRoot, UPTransition } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('maps source overlay opacity, z-index, and click callback', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPOverlay opacity={0.4} show onClick={onClick} />);

  expect(StyleSheet.flatten(screen.getByTestId('up-overlay').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 10070 }),
  );
  fireEvent.press(screen.getByTestId('up-overlay'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('keeps transition content through leave and emits source lifecycle callbacks', () => {
  jest.useFakeTimers();
  const onBeforeLeave = jest.fn();
  const onLeave = jest.fn();
  const onAfterLeave = jest.fn();
  const screen = renderRoot(
    <UPTransition duration={100} show>
      <Text>Body</Text>
    </UPTransition>,
  );

  screen.rerender(
    <UPRoot>
      <UPTransition
        duration={100}
        show={false}
        onAfterLeave={onAfterLeave}
        onBeforeLeave={onBeforeLeave}
        onLeave={onLeave}
      >
        <Text>Body</Text>
      </UPTransition>
    </UPRoot>,
  );
  expect(screen.getByText('Body')).toBeTruthy();
  expect(onBeforeLeave).toHaveBeenCalledTimes(1);
  expect(onLeave).toHaveBeenCalledTimes(1);

  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(onAfterLeave).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Body')).toBeNull();
  jest.useRealTimers();
});
