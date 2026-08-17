import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPIcon, UPRadio, UPRadioGroup, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('applies the source color prop to the checkmark icon', () => {
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPRadioGroup onChange={onChange} value="a">
      <UPRadio color="#ff0000" name="a" />
    </UPRadioGroup>,
  );
  fireEvent.press(screen.getByTestId('up-radio-a'));
  expect(onChange).toHaveBeenCalledWith('a');
  const icon = screen.UNSAFE_getByType(UPIcon);
  expect(icon.props.color).toBe('#ff0000');
});
