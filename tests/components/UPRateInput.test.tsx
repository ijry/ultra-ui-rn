import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPRoot, UPRate } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits source input alias with the selected score', () => {
  const onInput = jest.fn();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPRate count={5} onChange={onChange} onInput={onInput} value={1} />,
  );
  fireEvent.press(screen.getByTestId('up-rate-item-3'));
  expect(onInput).toHaveBeenCalledWith(4);
  expect(onChange).toHaveBeenCalledWith(4);
});
