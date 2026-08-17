import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPSwitch } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits source input alias with the next value on toggle', () => {
  const onInput = jest.fn();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPSwitch activeValue={1} inactiveValue={0} onChange={onChange} onInput={onInput} value={0} />,
  );
  fireEvent.press(screen.getByTestId('up-switch'));
  expect(onInput).toHaveBeenCalledWith(1);
  expect(onChange).toHaveBeenCalledWith(1);
});
