import React from 'react';
import { Keyboard, StyleSheet, type KeyboardEvent } from 'react-native';
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

it('fires source input alias and keyboard height change events', () => {
  const onInput = jest.fn();
  const onKeyboard = jest.fn();
  const listeners: Record<string, (event: KeyboardEvent) => void> = {};
  const keyboardSpy = jest
    .spyOn(Keyboard, 'addListener')
    .mockImplementation((type: string, callback: (event: KeyboardEvent) => void) => {
      listeners[type] = callback;
      return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
    });
  const screen = renderInput(
    <UPInput onInput={onInput} onKeyboardheightchange={onKeyboard} value="a" />,
  );
  fireEvent.changeText(screen.getByTestId('up-input-native'), 'abc');
  expect(onInput).toHaveBeenCalledWith('abc');
  act(() => {
    listeners.keyboardDidShow?.({ duration: 0, easing: 'easeOut', endCoordinates: { height: 300, screenX: 0, screenY: 0, width: 0 } });
    listeners.keyboardDidHide?.({ duration: 0, easing: 'easeOut', endCoordinates: { height: 0, screenX: 0, screenY: 0, width: 0 } });
  });
  expect(onKeyboard).toHaveBeenCalledWith({ height: 300 });
  expect(onKeyboard).toHaveBeenCalledWith({ height: 0 });
  keyboardSpy.mockRestore();
});

it('emits textarea source input and linechange events', () => {
  const onInput = jest.fn();
  const onLinechange = jest.fn();
  const screen = renderInput(
    <UPTextarea height={60} onInput={onInput} onLinechange={onLinechange} value="a" />,
  );
  fireEvent.changeText(screen.getByTestId('up-textarea-native'), 'a\nb');
  expect(onInput).toHaveBeenCalledWith('a\nb');
  expect(onLinechange).toHaveBeenCalledWith({ height: 60, lineCount: 2 });
});

it('emits search source input alias', () => {
  const onInput = jest.fn();
  const screen = renderInput(
    <UPSearch onInput={onInput} />,
  );
  fireEvent.changeText(screen.getByTestId('up-search-native'), 'abc');
  expect(onInput).toHaveBeenCalledWith('abc');
});
