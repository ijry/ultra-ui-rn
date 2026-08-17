import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPBox, UPSection, UPTitle, UPRoot } from '../../src';

function renderContainer(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses source title prefix dimensions and accepts a prefix override', () => {
  const screen = renderContainer(
    <>
      <UPTitle>Title</UPTitle>
      <UPTitle prefix={<Text testID="custom-title-prefix">Custom</Text>}>Override</UPTitle>
    </>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-title-prefix').props.style)).toEqual(
    expect.objectContaining({ height: 18, marginRight: 10, width: 4 }),
  );
  expect(screen.getByTestId('custom-title-prefix')).toBeTruthy();
});

it('uses section defaults and reports right-side presses', () => {
  const onClick = jest.fn();
  const screen = renderContainer(<UPSection title="News" onClick={onClick} />);

  fireEvent.press(screen.getByTestId('up-section-right'));

  expect(screen.getByText('更多')).toBeTruthy();
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(screen.getByTestId('up-section').props.style)).toEqual(
    expect.objectContaining({ borderLeftColor: '#3c9cff', borderLeftWidth: 4 }),
  );
});

it('lays out source box panels and accepts named React node overrides', () => {
  const screen = renderContainer(
    <UPBox left={<Text testID="box-left-override">Left slot</Text>} />,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-box').props.style)).toEqual(
    expect.objectContaining({ height: 160 }),
  );
  expect(screen.getByTestId('box-left-override')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-box-right-gap').props.style)).toEqual(
    expect.objectContaining({ height: 15 }),
  );
});
