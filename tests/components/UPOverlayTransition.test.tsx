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

it('does not re-fire enter callbacks when the parent re-renders', () => {
  // The lifecycle effect used to depend on the whole props object, so every
  // parent render re-ran it — re-firing enter/leave and restarting the
  // animation. A handler that set parent state looped forever.
  const onEnter = jest.fn();
  const onBeforeEnter = jest.fn();

  function Parent() {
    const [, setTick] = React.useState(0);
    return (
      <>
        <Text onPress={() => setTick((n) => n + 1)}>bump</Text>
        <UPTransition duration={100} onBeforeEnter={onBeforeEnter} onEnter={onEnter} show>
          <Text>Body</Text>
        </UPTransition>
      </>
    );
  }
  const screen = renderRoot(<Parent />);
  expect(onEnter).toHaveBeenCalledTimes(1);

  fireEvent.press(screen.getByText('bump'));
  fireEvent.press(screen.getByText('bump'));

  expect(onEnter).toHaveBeenCalledTimes(1);
  expect(onBeforeEnter).toHaveBeenCalledTimes(1);
});

it('treats an initial show=false as not-yet-shown, not a leave', () => {
  // Mounting hidden used to fire the leave pair even though nothing had entered.
  const onBeforeLeave = jest.fn();
  const onLeave = jest.fn();
  renderRoot(
    <UPTransition duration={100} onBeforeLeave={onBeforeLeave} onLeave={onLeave} show={false}>
      <Text>Body</Text>
    </UPTransition>,
  );
  expect(onBeforeLeave).not.toHaveBeenCalled();
  expect(onLeave).not.toHaveBeenCalled();
});
