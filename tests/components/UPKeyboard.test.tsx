import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import {
  UP,
  UPCarKeyboard,
  UPKeyboard,
  UPNumberKeyboard,
  UPRoot,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('emits source-shaped number and card values from the standalone number keyboard', () => {
  const onChange = jest.fn();
  const onBackspace = jest.fn();
  const screen = renderRoot(
    <UPNumberKeyboard mode="card" onBackspace={onBackspace} onChange={onChange} />,
  );

  fireEvent.press(screen.getByTestId('up-number-keyboard-key-X'));
  fireEvent.press(screen.getByTestId('up-number-keyboard-key-1'));
  fireEvent(screen.getByTestId('up-number-keyboard-backspace'), 'pressIn');

  expect(onChange).toHaveBeenNthCalledWith(1, 'X');
  expect(onChange).toHaveBeenNthCalledWith(2, 1);
  expect(onBackspace).toHaveBeenCalledTimes(1);
});

it('uses the source full-width zero layout and repeats backspace until release', () => {
  jest.useFakeTimers();
  const onBackspace = jest.fn();
  const screen = renderRoot(<UPNumberKeyboard dotDisabled onBackspace={onBackspace} />);
  const zero = screen.getByTestId('up-number-keyboard-key-0');
  const backspace = screen.getByTestId('up-number-keyboard-backspace');

  expect(zero.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ flex: 2 })]));
  fireEvent(backspace, 'pressIn');
  act(() => jest.advanceTimersByTime(500));
  fireEvent(backspace, 'pressOut');
  act(() => jest.advanceTimersByTime(500));

  expect(onBackspace).toHaveBeenCalledTimes(3);
});

it('keeps random number keys at their regular source width', () => {
  const random = jest.spyOn(Math, 'random').mockReturnValue(0);
  const screen = renderRoot(<UPNumberKeyboard dotDisabled random />);

  expect(screen.getByTestId('up-number-keyboard-key-0').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ flex: 1 })]),
  );
  random.mockRestore();
});

it('supports source car-keyboard layouts, random mode, and auto change', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPCarKeyboard autoChange onChange={onChange} random={false} />,
  );

  expect(screen.getByTestId('up-car-keyboard-key-京')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-car-keyboard-key-京'));
  act(() => jest.advanceTimersByTime(200));

  expect(onChange).toHaveBeenCalledWith('京');
  expect(screen.getByTestId('up-car-keyboard-key-Q')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-car-keyboard-language-toggle'));
  expect(screen.getByTestId('up-car-keyboard-key-京')).toBeTruthy();
});

it('composes source toolbar callbacks, child content, and controlled overlay closure', () => {
  const onCancel = jest.fn();
  const onChangeShow = jest.fn();
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPKeyboard
      onCancel={onCancel}
      onChange={onChange}
      onChangeShow={onChangeShow}
      onClose={onClose}
      onConfirm={onConfirm}
      show
      tips="Enter amount"
    >
      <Text>Keyboard header</Text>
    </UPKeyboard>,
  );

  expect(screen.getByText('Keyboard header')).toBeTruthy();
  expect(screen.getByText('Enter amount')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-keyboard-cancel'));
  fireEvent.press(screen.getByTestId('up-keyboard-confirm'));
  fireEvent.press(screen.getByTestId('up-number-keyboard-key-1'));
  fireEvent.press(screen.getByTestId('up-popup-overlay'));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(1);
  expect(onChangeShow).toHaveBeenCalledWith(false);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('omits source toolbar actions when their visibility flags are disabled', () => {
  const screen = renderRoot(
    <UPKeyboard show showCancel={false} showConfirm={false} showTips={false} />,
  );

  expect(screen.getByTestId('up-keyboard-toolbar')).toBeTruthy();
  expect(screen.queryByTestId('up-keyboard-cancel')).toBeNull();
  expect(screen.queryByTestId('up-keyboard-confirm')).toBeNull();
});

it('reacts to configured keyboard defaults while explicit component props win', () => {
  const screen = renderRoot(<UPKeyboard show />);

  act(() => {
    UP.setConfig({ props: { keyboard: { confirmText: 'Configured done', tips: 'Configured tips' } } });
  });
  expect(screen.getByText('Configured done')).toBeTruthy();
  expect(screen.getByText('Configured tips')).toBeTruthy();

  screen.rerender(
    <UPRoot><UPKeyboard confirmText="Explicit done" show tips="Explicit tips" /></UPRoot>,
  );
  expect(screen.getByText('Explicit done')).toBeTruthy();
  expect(screen.getByText('Explicit tips')).toBeTruthy();
});
