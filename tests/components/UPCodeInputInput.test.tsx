import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPCodeInput, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits source input alias with the entered code', () => {
  const onInput = jest.fn();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPCodeInput maxlength={4} onChange={onChange} onInput={onInput} />,
  );
  fireEvent.changeText(screen.getByTestId('up-code-input-native'), '12');
  expect(onInput).toHaveBeenCalledWith('12');
  expect(onChange).toHaveBeenCalledWith('12');
});
