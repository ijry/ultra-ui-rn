import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPActionSheetData, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const options = [
  { value: 'sh', name: '上海' },
  { value: 'bj', name: '北京' },
];

it('emits onChange with the selected option value', () => {
  const onChange = jest.fn();
  const onInput = jest.fn();
  const screen = renderRoot(
    <UPActionSheetData onChange={onChange} onInput={onInput} options={options} />,
  );
  fireEvent.press(screen.getByTestId('up-action-sheet-data-trigger'));
  fireEvent.press(screen.getByTestId('up-action-sheet-action-1'));
  expect(onChange).toHaveBeenCalledWith('bj');
  expect(onInput).toHaveBeenCalledWith('bj');
});

it('shows the label of the current modelValue in the trigger input', () => {
  const screen = renderRoot(<UPActionSheetData modelValue="sh" options={options} />);
  const input = screen.getByTestId('up-action-sheet-data-input');
  expect(input.props.value).toBe('上海');
});

it('supports custom valueKey/labelKey', () => {
  const onChange = jest.fn();
  const customOptions = [{ code: 1, text: 'A' }, { code: 2, text: 'B' }];
  const screen = renderRoot(
    <UPActionSheetData labelKey="text" onChange={onChange} options={customOptions} valueKey="code" />,
  );
  fireEvent.press(screen.getByTestId('up-action-sheet-data-trigger'));
  fireEvent.press(screen.getByTestId('up-action-sheet-action-1'));
  expect(onChange).toHaveBeenCalledWith(2);
});
