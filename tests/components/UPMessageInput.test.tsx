import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPMessageInput, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits change on each input and finish at maxlength', () => {
  const onChange = jest.fn();
  const onFinish = jest.fn();
  const screen = renderRoot(
    <UPMessageInput maxlength={4} onChange={onChange} onFinish={onFinish} />,
  );
  fireEvent.changeText(screen.getByTestId('up-message-input-native'), '123');
  expect(onChange).toHaveBeenCalledWith('123');
  expect(onFinish).not.toHaveBeenCalled();
  fireEvent.changeText(screen.getByTestId('up-message-input-native'), '1234');
  expect(onChange).toHaveBeenCalledWith('1234');
  expect(onFinish).toHaveBeenCalledWith('1234');
});

it('renders one cell per maxlength and masks characters with dotFill', () => {
  const screen = renderRoot(<UPMessageInput dotFill maxlength={3} value="12" />);
  expect(screen.getByTestId('up-message-input-box-0')).toBeTruthy();
  expect(screen.getByTestId('up-message-input-box-1')).toBeTruthy();
  expect(screen.getByTestId('up-message-input-box-2')).toBeTruthy();
  expect(screen.getByTestId('up-message-input-box-0')).toHaveTextContent('•');
  expect(screen.getByTestId('up-message-input-box-2')).not.toHaveTextContent('•');
});

it('caps input at maxlength', () => {
  const onChange = jest.fn();
  const screen = renderRoot(<UPMessageInput maxlength={3} onChange={onChange} />);
  fireEvent.changeText(screen.getByTestId('up-message-input-native'), '12345');
  expect(onChange).toHaveBeenCalledWith('123');
});
