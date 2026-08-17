import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPTag, UPRoot } from '../../src';

function renderTag(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses source medium primary metrics and sends the source name on click', () => {
  const onClick = jest.fn();
  const screen = renderTag(<UPTag name="featured" text="Featured" onClick={onClick} />);

  fireEvent.press(screen.getByTestId('up-tag'));

  expect(onClick).toHaveBeenCalledWith('featured');
  expect(StyleSheet.flatten(screen.getByTestId('up-tag').props.style)).toEqual(
    expect.objectContaining({
      backgroundColor: '#3c9cff',
      borderColor: '#3c9cff',
      borderRadius: 3,
      height: 26,
      paddingHorizontal: 10,
    }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-tag-text').props.style)).toEqual(
    expect.objectContaining({ color: '#ffffff', fontSize: 13 }),
  );
});

it('supports plain fills, icons, custom colors, and close callbacks', () => {
  const onClose = jest.fn();
  const screen = renderTag(
    <UPTag
      closable
      color="#123456"
      icon="heart"
      name="new"
      plain
      plainFill
      text="New"
      onClose={onClose}
    />,
  );

  fireEvent.press(screen.getByTestId('up-tag-close'));

  expect(onClose).toHaveBeenCalledWith('new');
  expect(screen.getByTestId('up-tag-icon')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-tag').props.style)).toEqual(
    expect.objectContaining({ borderColor: '#3c9cff' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-tag-text').props.style)).toEqual(
    expect.objectContaining({ color: '#123456' }),
  );
});

it('hides and disables tags using source-compatible props', () => {
  const onClick = jest.fn();
  const hidden = renderTag(<UPTag show={false} text="Hidden" />);
  expect(hidden.queryByTestId('up-tag')).toBeNull();

  const disabled = renderTag(<UPTag disabled text="Disabled" onClick={onClick} />);
  fireEvent.press(disabled.getByTestId('up-tag'));
  expect(onClick).not.toHaveBeenCalled();
});

it('allows composed components to supply a distinct tag test ID', () => {
  const screen = renderTag(<UPTag testID="composed-tag" text="Composed" />);

  expect(screen.getByTestId('composed-tag')).toBeTruthy();
  expect(screen.queryByTestId('up-tag')).toBeNull();
});
