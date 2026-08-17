import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPNumberBox, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits plus/minus and overlimit source events with correct boundaries', () => {
  const onPlus = jest.fn();
  const onMinus = jest.fn();
  const onOverlimit = jest.fn();
  const screen = renderRoot(
    <UPNumberBox
      max={10}
      min={0}
      onMinus={onMinus}
      onOverlimit={onOverlimit}
      onPlus={onPlus}
      showMinus
      showPlus
      defaultValue={5}
    />,
  );
  fireEvent.press(screen.getByTestId('up-number-box-plus'));
  expect(onPlus).toHaveBeenCalledTimes(1);
  expect(onOverlimit).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('up-number-box-minus'));
  expect(onMinus).toHaveBeenCalledTimes(1);
  for (let i = 0; i < 6; i += 1) {
    fireEvent.press(screen.getByTestId('up-number-box-plus'));
  }
  expect(onOverlimit).toHaveBeenCalledWith('plus');
  expect(onPlus).toHaveBeenCalledTimes(6);
});

it('emits overlimit when minus is pressed at the minimum', () => {
  const onOverlimit = jest.fn();
  const screen = renderRoot(
    <UPNumberBox
      min={0}
      onOverlimit={onOverlimit}
      showMinus
      showPlus
      value={0}
    />,
  );
  fireEvent.press(screen.getByTestId('up-number-box-minus'));
  expect(onOverlimit).toHaveBeenCalledWith('minus');
});

it('emits focus with value/name and input with the value on change', () => {
  const onFocus = jest.fn();
  const onInput = jest.fn();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPNumberBox
      name="quantity"
      onChange={onChange}
      onFocus={onFocus}
      onInput={onInput}
      showPlus
      value={3}
    />,
  );
  fireEvent(screen.getByTestId('up-number-box-input'), 'focus');
  expect(onFocus).toHaveBeenCalledWith({ value: 3, name: 'quantity' });
  fireEvent.press(screen.getByTestId('up-number-box-plus'));
  expect(onInput).toHaveBeenCalledWith(4);
  expect(onChange).toHaveBeenCalledWith(4, 'quantity');
});
