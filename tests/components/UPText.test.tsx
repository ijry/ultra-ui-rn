import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPText, UPRoot } from '../../src';

function renderText(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses source text defaults and responds to global overrides', () => {
  const initial = renderText(<UPText text="Source text" />);

  expect(StyleSheet.flatten(initial.getByTestId('up-text-value').props.style)).toEqual(
    expect.objectContaining({ color: '#606266', fontSize: 15 }),
  );

  act(() => {
    UP.setConfig({ props: { text: { size: 18 } } });
  });
  const overridden = renderText(<UPText text="Overridden" />);
  expect(StyleSheet.flatten(overridden.getByTestId('up-text-value').props.style)).toEqual(
    expect.objectContaining({ fontSize: 18 }),
  );
});

it('formats price, phone, name, and date source modes', () => {
  const price = renderText(<UPText mode="price" text="12.5" />);
  expect(price.getByText('￥')).toBeTruthy();
  expect(price.getByText('12.50')).toBeTruthy();

  const phone = renderText(<UPText format="encrypt" mode="phone" text="13812345678" />);
  expect(phone.getByText('138****5678')).toBeTruthy();

  const name = renderText(<UPText format="encrypt" mode="name" text="张三丰" />);
  expect(name.getByText('张*丰')).toBeTruthy();

  const date = renderText(<UPText mode="date" text="2026-07-25T10:00:00.000Z" />);
  expect(date.getByText('2026-07-25')).toBeTruthy();
});

it('renders prefix and suffix icons, lines, and reports clicks', () => {
  const onClick = jest.fn();
  const screen = renderText(
    <UPText
      lines={2}
      prefixIcon="heart"
      suffixIcon="arrow-right"
      text="Tap"
      onClick={onClick}
    />,
  );

  fireEvent.press(screen.getByTestId('up-text'));

  expect(screen.getByTestId('up-text-prefix-icon')).toBeTruthy();
  expect(screen.getByTestId('up-text-suffix-icon')).toBeTruthy();
  expect(screen.getByTestId('up-text-value').props.numberOfLines).toBe(2);
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('does not render when the source show prop is false', () => {
  const screen = renderText(<UPText show={false} text="Hidden" />);

  expect(screen.queryByTestId('up-text')).toBeNull();
});
