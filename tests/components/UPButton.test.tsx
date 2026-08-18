import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UP, UPButton, UPRoot } from '../../src';

function renderButton(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function getButtonStyle(screen: ReturnType<typeof render>) {
  const style = screen.getByTestId('up-button').props.style;
  return StyleSheet.flatten(style);
}

it('uses source normal-info metrics and dispatches clicks', () => {
  const onClick = jest.fn();
  const screen = renderButton(<UPButton text="Save" onClick={onClick} />);

  fireEvent.press(screen.getByTestId('up-button'));

  expect(onClick).toHaveBeenCalledTimes(1);
  expect(getButtonStyle(screen)).toEqual(
    expect.objectContaining({
      backgroundColor: '#ffffff',
      borderColor: '#e4e7ed',
      height: 40,
      paddingHorizontal: 12,
    }),
  );
});

it('prevents clicks while disabled or loading', () => {
  const onClick = jest.fn();
  const disabled = renderButton(
    <UPButton disabled text="Disabled" onClick={onClick} />,
  );
  fireEvent.press(disabled.getByTestId('up-button'));
  const loading = renderButton(
    <UPButton loading text="Loading" onClick={onClick} />,
  );
  fireEvent.press(loading.getByTestId('up-button'));

  expect(onClick).not.toHaveBeenCalled();
  expect(loading.getByTestId('up-button-loading')).toBeTruthy();
});

it('uses source primary plain colors and preserves a custom color', () => {
  const plain = renderButton(<UPButton plain text="Plain" type="primary" />);
  expect(getButtonStyle(plain)).toEqual(
    expect.objectContaining({
      backgroundColor: '#ffffff',
      borderColor: '#3c9cff',
    }),
  );

  const custom = renderButton(<UPButton color="#123456" text="Custom" />);
  expect(getButtonStyle(custom)).toEqual(
    expect.objectContaining({
      backgroundColor: '#123456',
      borderColor: '#123456',
    }),
  );
});

it('reacts to global button defaults', () => {
  UP.setConfig({ props: { button: { size: 'mini' } } });
  const screen = renderButton(<UPButton text="Mini" />);

  expect(getButtonStyle(screen)).toEqual(
    expect.objectContaining({ height: 22, minWidth: 50 }),
  );
});
