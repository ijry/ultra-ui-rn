import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPSlider } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits source start and input events', () => {
  const onStart = jest.fn();
  const onInput = jest.fn();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPSlider
      max={10}
      min={0}
      onChange={onChange}
      onInput={onInput}
      onStart={onStart}
      step={5}
      value={0}
    />,
  );
  fireEvent(screen.getByTestId('up-slider-value-1'), 'pressIn');
  expect(onStart).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId('up-slider-value-2'));
  expect(onInput).toHaveBeenCalledWith(10);
  expect(onChange).toHaveBeenCalledWith(10);
});
