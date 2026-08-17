import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPCol, UPGrid, UPGridItem, UPRoot, UPRow } from '../../src';

function renderLayout(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('applies source row gutters and twelve-column span metrics', () => {
  const screen = renderLayout(
    <UPRow gutter="20px">
      <UPCol offset={3} span={6}>
        <Text>Half</Text>
      </UPCol>
    </UPRow>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-row').props.style)).toEqual(
    expect.objectContaining({ marginHorizontal: -10 }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-col').props.style)).toEqual(
    expect.objectContaining({
      flexBasis: '50%',
      marginLeft: '25%',
      maxWidth: '50%',
      paddingHorizontal: 10,
    }),
  );
});

it('forwards row/column presses and source alignments', () => {
  const onRowClick = jest.fn();
  const onColClick = jest.fn();
  const screen = renderLayout(
    <UPRow align="bottom" justify="between" onClick={onRowClick}>
      <UPCol align="top" justify="center" onClick={onColClick}>
        <Text>Cell</Text>
      </UPCol>
    </UPRow>,
  );

  fireEvent.press(screen.getByTestId('up-col'));
  fireEvent.press(screen.getByTestId('up-row'));
  expect(onColClick).toHaveBeenCalledTimes(1);
  expect(onRowClick).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(screen.getByTestId('up-row').props.style)).toEqual(
    expect.objectContaining({ alignItems: 'flex-end', justifyContent: 'space-between' }),
  );
});

it('uses global grid defaults and maps item names/indexes and borders', () => {
  act(() => {
    UP.setConfig({ props: { grid: { col: 4 } } });
  });
  const defaultGrid = renderLayout(
    <UPGrid>
      <UPGridItem><Text>Default</Text></UPGridItem>
    </UPGrid>,
  );
  expect(StyleSheet.flatten(defaultGrid.getByTestId('up-grid-item-0').props.style)).toEqual(
    expect.objectContaining({ flexBasis: '25%', maxWidth: '25%' }),
  );

  const onGridClick = jest.fn();
  const onItemClick = jest.fn();
  const screen = renderLayout(
    <UPGrid border col={2} onClick={onGridClick}>
      <UPGridItem name="a" />
      <UPGridItem name="b" />
      <UPGridItem onClick={onItemClick} />
    </UPGrid>,
  );

  fireEvent.press(screen.getByTestId('up-grid-item-2'));
  expect(onGridClick).toHaveBeenCalledWith(2);
  expect(onItemClick).toHaveBeenCalledWith(2);
  expect(StyleSheet.flatten(screen.getByTestId('up-grid-item-0').props.style)).toEqual(
    expect.objectContaining({ borderBottomWidth: 0.5, borderRightWidth: 0.5 }),
  );
});
