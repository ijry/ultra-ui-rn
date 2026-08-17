import React from 'react';
import { StyleSheet, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { UPBadge, UPRoot } from '../../src';

function renderBadge(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('formats source overflow, ellipsis, and limit values', () => {
  const overflow = renderBadge(<UPBadge value={1000} />);
  expect(overflow.getByText('999+')).toBeTruthy();

  const ellipsis = renderBadge(<UPBadge max={99} numberType="ellipsis" value={100} />);
  expect(ellipsis.getByText('...')).toBeTruthy();

  const limit = renderBadge(<UPBadge numberType="limit" value={2200} />);
  expect(limit.getByText('2.2k')).toBeTruthy();
});

it('supports zero visibility, dots, and absolute offsets', () => {
  const hidden = renderBadge(<UPBadge value={0} />);
  expect(hidden.queryByTestId('up-badge')).toBeNull();

  const dot = renderBadge(<UPBadge isDot value={0} />);
  expect(StyleSheet.flatten(dot.getByTestId('up-badge').props.style)).toEqual(
    expect.objectContaining({ height: 8, width: 8 }),
  );

  const absolute = renderBadge(
    <View>
      <UPBadge absolute offset={['2px', '3px']} value={1} />
    </View>,
  );
  expect(StyleSheet.flatten(absolute.getByTestId('up-badge').props.style)).toEqual(
    expect.objectContaining({ position: 'absolute', right: 3, top: 2 }),
  );
});

it('wraps children for attached badges and honors inverted colors', () => {
  const screen = renderBadge(
    <UPBadge inverted type="success" value={8}>
      <View testID="badge-anchor" />
    </UPBadge>,
  );

  expect(screen.getByTestId('badge-anchor')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-badge').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#ffffff', color: '#5ac725' }),
  );
});
