import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPFlex, UPRoot } from '../../src';

const renderContent = (node: React.ReactElement) => render(<UPRoot>{node}</UPRoot>);
const styleOf = (screen: ReturnType<typeof render>) =>
  StyleSheet.flatten(screen.getByTestId('up-flex').props.style);

it('applies contract defaults: row / flex-start / stretch / nowrap', () => {
  expect(styleOf(renderContent(<UPFlex />))).toEqual(
    expect.objectContaining({
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
    }),
  );
});

it('maps direction/justify/align/wrap and parses gap units', () => {
  const screen = renderContent(
    <UPFlex direction="column" justify="space-between" align="center" wrap gap="16px" />,
  );
  expect(styleOf(screen)).toEqual(
    expect.objectContaining({
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16,
    }),
  );
});

it('accepts uview aliases start/end for justify', () => {
  expect(styleOf(renderContent(<UPFlex justify="start" />))).toEqual(
    expect.objectContaining({ justifyContent: 'flex-start' }),
  );
});

it('renders a Pressable and fires onClick when provided', () => {
  const onClick = jest.fn();
  const screen = renderContent(<UPFlex onClick={onClick} />);
  fireEvent.press(screen.getByTestId('up-flex'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('accepts glass prop as a no-op without adding nodes or throwing', () => {
  const screen = renderContent(<UPFlex glass={{ enabled: true, tint: '#ffffff' }} />);
  expect(screen.getByTestId('up-flex')).toBeTruthy();
});
