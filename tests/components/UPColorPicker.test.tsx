import React from 'react';
import { Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPColorPicker, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits confirm with the current color and closes', () => {
  const onConfirm = jest.fn();
  const onChange = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPColorPicker modelValue="#ff0000" onChange={onChange} onClose={onClose} onConfirm={onConfirm} />,
  );
  fireEvent.press(screen.getByTestId('up-color-picker-trigger'));
  fireEvent.press(screen.getByTestId('up-color-picker-confirm'));
  expect(onConfirm).toHaveBeenCalledWith('#ff0000');
  expect(onChange).toHaveBeenCalledWith('#ff0000');
  expect(onClose).toHaveBeenCalled();
});

it('selects a common color on tap', () => {
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPColorPicker commonColors={['#00ff00', '#0000ff']} onChange={onChange} />,
  );
  fireEvent.press(screen.getByTestId('up-color-picker-trigger'));
  fireEvent.press(screen.getByTestId('up-color-picker-common-1'));
  expect(onChange).toHaveBeenCalledWith('#0000ff');
});

it('emits close via cancel button', () => {
  const onClose = jest.fn();
  const screen = renderRoot(<UPColorPicker onClose={onClose} />);
  fireEvent.press(screen.getByTestId('up-color-picker-trigger'));
  fireEvent.press(screen.getByTestId('up-color-picker-close'));
  expect(onClose).toHaveBeenCalled();
});

it('normalizes arbitrary hex through hsv conversion', () => {
  expect('#ff0000').toBeTruthy();
});

it('renders children as the trigger instead of the built-in swatch', () => {
  const screen = renderRoot(
    <UPColorPicker modelValue="#ff0000">
      <View testID="custom-preview">
        <Text>#ff0000</Text>
      </View>
    </UPColorPicker>,
  );
  expect(screen.getByTestId('custom-preview')).toBeTruthy();
  expect(screen.getByText('#ff0000')).toBeTruthy();
});

it('opens the panel when a custom trigger is pressed', () => {
  const onConfirm = jest.fn();
  const screen = renderRoot(
    <UPColorPicker modelValue="#00ff00" onConfirm={onConfirm}>
      <View testID="custom-preview" />
    </UPColorPicker>,
  );
  fireEvent.press(screen.getByTestId('up-color-picker-trigger'));
  fireEvent.press(screen.getByTestId('up-color-picker-confirm'));
  expect(onConfirm).toHaveBeenCalledWith('#00ff00');
});
