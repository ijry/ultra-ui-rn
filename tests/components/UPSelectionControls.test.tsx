import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  UPCheckbox,
  UPCheckboxGroup,
  UPCodeInput,
  UPNumberBox,
  UPRadio,
  UPRadioGroup,
  UPRate,
  UPRoot,
  UPSlider,
  UPSwitch,
} from '../../src';

function renderControl(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('maps switch active values, async behavior, and source dimensions', () => {
  const onChange = jest.fn();
  const screen = renderControl(
    <UPSwitch activeValue="yes" inactiveValue="no" value="no" onChange={onChange} />,
  );
  fireEvent.press(screen.getByTestId('up-switch'));
  expect(onChange).toHaveBeenCalledWith('yes');
  expect(StyleSheet.flatten(screen.getByTestId('up-switch').props.style)).toEqual(
    expect.objectContaining({ height: 27, width: 52 }),
  );

  const asyncChange = jest.fn();
  const pending = renderControl(<UPSwitch asyncChange value={false} onChange={asyncChange} />);
  fireEvent.press(pending.getByTestId('up-switch'));
  expect(asyncChange).toHaveBeenCalledWith(true);
});

it('inherits checkbox group state and emits a changed source value list', () => {
  const onChange = jest.fn();
  const screen = renderControl(
    <UPCheckboxGroup value={['a']} onChange={onChange}>
      <UPCheckbox label="A" name="a" />
      <UPCheckbox label="B" name="b" />
    </UPCheckboxGroup>,
  );
  expect(screen.getByTestId('up-checkbox-a').props.accessibilityState.checked).toBe(true);
  fireEvent.press(screen.getByTestId('up-checkbox-b'));
  expect(onChange).toHaveBeenCalledWith(['a', 'b']);
});

it('inherits radio group state and only emits the selected name', () => {
  const onChange = jest.fn();
  const screen = renderControl(
    <UPRadioGroup value="a" onChange={onChange}>
      <UPRadio label="A" name="a" />
      <UPRadio label="B" name="b" />
    </UPRadioGroup>,
  );
  fireEvent.press(screen.getByTestId('up-radio-b'));
  expect(onChange).toHaveBeenCalledWith('b');
  expect(screen.getByTestId('up-radio-a').props.accessibilityState.checked).toBe(true);
});

it('uses source rate, number box, code input, and slider callbacks', () => {
  const onRate = jest.fn();
  const rate = renderControl(<UPRate allowHalf value={1} onChange={onRate} />);
  fireEvent.press(rate.getByTestId('up-rate-item-2'));
  expect(onRate).toHaveBeenCalledWith(2.5);

  const onNumber = jest.fn();
  const box = renderControl(<UPNumberBox max={2} min={0} value={1} onChange={onNumber} />);
  fireEvent.press(box.getByTestId('up-number-box-plus'));
  expect(onNumber).toHaveBeenCalledWith(2, '');

  const onCode = jest.fn();
  const code = renderControl(<UPCodeInput maxlength={4} value="12" onChange={onCode} />);
  fireEvent.changeText(code.getByTestId('up-code-input-native'), '1234');
  expect(onCode).toHaveBeenCalledWith('1234');
  expect(code.getByTestId('up-code-input-box-0')).toBeTruthy();

  const onSlider = jest.fn();
  const slider = renderControl(<UPSlider max={10} min={0} step={2} value={0} onChange={onSlider} />);
  fireEvent.press(slider.getByTestId('up-slider-value-3'));
  expect(onSlider).toHaveBeenCalledWith(6);
});
