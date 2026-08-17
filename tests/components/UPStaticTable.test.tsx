import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import {
  UPRoot,
  UPTable,
  UPTd,
  UPTh,
  UPTr,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('inherits source table alignment, borders, typography, and percentage cell widths', () => {
  const screen = renderRoot(
    <UPTable align="left" borderColor="#123456" color="#234567" fontSize="16px" padding="8px 6px">
      <UPTr>
        <UPTh width="40%">Name</UPTh>
        <UPTh>Score</UPTh>
      </UPTr>
      <UPTr>
        <UPTd width="40%">Ada</UPTd>
        <UPTd>98</UPTd>
      </UPTr>
    </UPTable>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-table').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#ffffff', borderLeftColor: '#123456', borderTopColor: '#123456' }),
  );
  expect(StyleSheet.flatten(screen.getAllByTestId('up-th')[0].props.style)).toEqual(
    expect.objectContaining({ borderRightColor: '#123456', flexBasis: '40%' }),
  );
  expect(StyleSheet.flatten(screen.getAllByTestId('up-th-content')[0].props.style)).toEqual(
    expect.objectContaining({ textAlign: 'left' }),
  );
  expect(StyleSheet.flatten(screen.getAllByTestId('up-td')[0].props.style)).toEqual(
    expect.objectContaining({ paddingHorizontal: 6, paddingVertical: 8 }),
  );
  expect(StyleSheet.flatten(screen.getAllByTestId('up-td-content')[0].props.style)).toEqual(
    expect.objectContaining({ color: '#234567', fontSize: 16, textAlign: 'left' }),
  );
});

it('honors source td per-cell overrides and accepts ReactNode cell content', () => {
  const screen = renderRoot(
    <UPTable>
      <UPTr>
        <UPTd borderColor="#00aa00" color="#ff0000" fontSize="18px" textAlign="right">
          <Text>Custom</Text>
        </UPTd>
      </UPTr>
    </UPTable>,
  );

  expect(StyleSheet.flatten(screen.getByTestId('up-td').props.style)).toEqual(
    expect.objectContaining({ borderBottomColor: '#00aa00', borderRightColor: '#00aa00' }),
  );
  expect(screen.getByText('Custom')).toBeTruthy();
});
