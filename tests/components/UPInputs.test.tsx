import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPInput, UPRoot, UPSearch, UPTextarea } from '../../src';

function renderInput(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('maps source input defaults, formatter, change and clear callbacks', () => {
  const onChange = jest.fn();
  const screen = renderInput(
    <UPInput clearable formatter={(value) => value.toUpperCase()} value="a" onChange={onChange} />,
  );

  const nativeInput = screen.getByTestId('up-input-native');
  expect(StyleSheet.flatten(screen.getByTestId('up-input').props.style)).toEqual(
    expect.objectContaining({ borderWidth: 1, borderRadius: 3, height: 40 }),
  );
  fireEvent.changeText(nativeInput, 'abc');
  fireEvent.press(screen.getByTestId('up-input-clear'));

  expect(onChange).toHaveBeenNthCalledWith(1, 'ABC');
  expect(onChange).toHaveBeenNthCalledWith(2, '');
});

it('applies global input defaults and source password visibility behavior', () => {
  act(() => {
    UP.setConfig({ props: { input: { fontSize: '18px', password: true } } });
  });
  const screen = renderInput(<UPInput value="secret" />);
  const nativeInput = screen.getByTestId('up-input-native');
  expect(StyleSheet.flatten(nativeInput.props.style)).toEqual(expect.objectContaining({ fontSize: 18 }));
  expect(nativeInput.props.secureTextEntry).toBe(true);
  fireEvent.press(screen.getByTestId('up-input-password-toggle'));
  expect(screen.getByTestId('up-input-native').props.secureTextEntry).toBe(false);
});

it('renders source textarea dimensions, count, formatter, and multiline input', () => {
  const onChange = jest.fn();
  const screen = renderInput(
    <UPTextarea count formatter={(value) => value.trim()} maxlength={5} value="hi" onChange={onChange} />,
  );
  const nativeInput = screen.getByTestId('up-textarea-native');
  expect(nativeInput.props.multiline).toBe(true);
  expect(StyleSheet.flatten(screen.getByTestId('up-textarea').props.style)).toEqual(
    expect.objectContaining({ height: 70 }),
  );
  expect(screen.getByText('2/5')).toBeTruthy();
  fireEvent.changeText(nativeInput, ' hi ');
  expect(onChange).toHaveBeenCalledWith('hi');
});

it('maps source search defaults, action, clear, and change events', () => {
  const onChange = jest.fn();
  const onSearch = jest.fn();
  const onClear = jest.fn();
  const screen = renderInput(
    <UPSearch clearabled showAction value="find" onChange={onChange} onClear={onClear} onSearch={onSearch} />,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-search-field').props.style)).toEqual(
    expect.objectContaining({ borderRadius: 100, height: 32 }),
  );
  fireEvent.press(screen.getByTestId('up-search-clear'));
  fireEvent.press(screen.getByTestId('up-search-action'));
  fireEvent.changeText(screen.getByTestId('up-search-native'), 'next');

  expect(onClear).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('');
  expect(onSearch).toHaveBeenCalledWith('');
  expect(onChange).toHaveBeenCalledWith('next');
});
