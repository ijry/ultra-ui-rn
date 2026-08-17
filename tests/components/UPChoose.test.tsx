import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { UP, UPChoose, UPRoot, type UPChooseOption } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const options: readonly UPChooseOption[] = [
  { title: 'One', value: 'one' },
  { title: 'Two', value: 'two' },
  { title: 'Three', value: 'three' },
];

it('renders source tags and preserves loose current-index comparison', () => {
  const screen = renderRoot(<UPChoose modelValue={false} options={options} />);

  expect(screen.getByText('One')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#ffffff' }),
  );

  screen.rerender(<UPRoot><UPChoose modelValue="1" options={options} /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );

  screen.rerender(<UPRoot><UPChoose modelValue={['1']} options={options} /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
});

it('updates local source selection and emits the numeric index on ordinary presses', () => {
  const onUpdateModelValue = jest.fn();
  const screen = renderRoot(<UPChoose modelValue={0} onUpdateModelValue={onUpdateModelValue} options={options} />);

  fireEvent.press(screen.getByTestId('up-choose-option-2'));

  expect(onUpdateModelValue).toHaveBeenCalledWith(2);
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-2').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
});

it('emits custom-click without changing local selection or a model callback', () => {
  const onCustomClick = jest.fn();
  const onUpdateModelValue = jest.fn();
  const screen = renderRoot(
    <UPChoose customClick modelValue={0} onCustomClick={onCustomClick} onUpdateModelValue={onUpdateModelValue} options={options} />,
  );

  fireEvent.press(screen.getByTestId('up-choose-option-1'));

  expect(onCustomClick).toHaveBeenCalledWith(1);
  expect(onUpdateModelValue).not.toHaveBeenCalled();
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
});

it('maps label/layout props, ignores inactive value props, and exposes render-item press state', () => {
  const onUpdateModelValue = jest.fn();
  const renderItem = jest.fn(({ index, press, selected }) => (
    <Text onPress={press} testID={`custom-${index}`}>{`${index}:${selected}`}</Text>
  ));
  const screen = renderRoot(
    <UPChoose
      itemHeight="40px"
      itemPadding="6px"
      itemWidth="120px"
      labelName="label"
      modelValue="1"
      options={[{ label: 'Alpha', value: 99 }, { label: 'Beta', value: 1 }]}
      renderItem={renderItem}
      type="checkbox"
      valueName="value"
      wrap={false}
      onUpdateModelValue={onUpdateModelValue}
    />,
  );

  expect(screen.getByTestId('up-choose-scroll')).toBeTruthy();
  expect(renderItem).toHaveBeenCalledWith(expect.objectContaining({ index: 1, selected: true }));
  fireEvent.press(screen.getByTestId('custom-0'));
  expect(onUpdateModelValue).toHaveBeenCalledWith(0);
});

it('reacts to mounted source defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPChoose />);

  act(() => {
    UP.setConfig({ props: { choose: { options: [{ title: 'Configured' }], itemHeight: '36px' } } });
  });
  expect(screen.getByText('Configured')).toBeTruthy();

  screen.rerender(<UPRoot><UPChoose options={[{ title: 'Explicit' }]} /></UPRoot>);
  expect(screen.getByText('Explicit')).toBeTruthy();
});
