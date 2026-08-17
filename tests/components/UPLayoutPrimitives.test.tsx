import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPDivider, UPGap, UPLine, UPRoot, UPView, getPx } from '../../src';

function renderPrimitive(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('converts source dimensions and observes global gap defaults', () => {
  act(() => {
    UP.setConfig({ props: { gap: { height: '40rpx' } } });
  });
  const screen = renderPrimitive(<UPGap marginTop="1px 2px" />);

  expect(StyleSheet.flatten(screen.getByTestId('up-gap').props.style)).toEqual(
    expect.objectContaining({ height: getPx('40rpx'), marginTop: 1 }),
  );
});

it('renders source hairline row and column lines', () => {
  const screen = renderPrimitive(
    <>
      <UPLine length="20px" />
      <UPLine direction="col" length="30px" />
    </>,
  );

  expect(StyleSheet.flatten(screen.getAllByTestId('up-line')[0].props.style)).toEqual(
    expect.objectContaining({ transform: [{ scaleY: 0.5 }], width: 20 }),
  );
  expect(StyleSheet.flatten(screen.getAllByTestId('up-line')[1].props.style)).toEqual(
    expect.objectContaining({ height: 30, transform: [{ scaleX: 0.5 }] }),
  );
});

it('aligns divider side lines, supports clicks, and maps base view styles', () => {
  const onClick = jest.fn();
  const screen = renderPrimitive(
    <>
      <UPDivider text="More" textPosition="left" onClick={onClick} />
      <UPView backgroundColor="#ffffff" flex1 onClick={onClick} padding="10px" />
    </>,
  );

  fireEvent.press(screen.getByTestId('up-divider'));
  fireEvent.press(screen.getByTestId('up-view'));

  expect(onClick).toHaveBeenCalledTimes(2);
  expect(StyleSheet.flatten(screen.getByTestId('up-divider-left-line').props.style)).toEqual(
    expect.objectContaining({ width: getPx('80rpx') }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-view').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#ffffff', flex: 1, padding: 10 }),
  );
});
