import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { UPCard, UPCell, UPCellGroup, UPRoot } from '../../src';

function renderContent(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('uses source cell metrics, content, required state, arrow, border, and callback payload', () => {
  const onClick = jest.fn();
  const screen = renderContent(
    <UPCell
      isLink
      label="Account details"
      name="profile"
      required
      title="Profile"
      value="Configured"
      onClick={onClick}
    />,
  );

  fireEvent.press(screen.getByTestId('up-cell'));

  expect(onClick).toHaveBeenCalledWith({ name: 'profile' });
  expect(screen.getByText('*')).toBeTruthy();
  expect(screen.getByTestId('up-cell-right-icon')).toBeTruthy();
  expect(screen.getByTestId('up-cell-border')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-cell-body').props.style)).toEqual(
    expect.objectContaining({ paddingHorizontal: 15, paddingVertical: 13 }),
  );
});

it('keeps disabled cells inert and supports ReactNode title/value overrides', () => {
  const onClick = jest.fn();
  const disabled = renderContent(<UPCell disabled title="Disabled" onClick={onClick} />);
  fireEvent.press(disabled.getByTestId('up-cell'));
  expect(onClick).not.toHaveBeenCalled();

  const slots = renderContent(
    <UPCell titleNode={<Text>Custom title</Text>} valueNode={<Text>Custom value</Text>} />,
  );
  expect(slots.getByText('Custom title')).toBeTruthy();
  expect(slots.getByText('Custom value')).toBeTruthy();
});

it('renders source cell group title and surrounding border', () => {
  const screen = renderContent(
    <UPCellGroup title="Preferences">
      <UPCell title="Settings" />
    </UPCellGroup>,
  );

  expect(screen.getByText('Preferences')).toBeTruthy();
  expect(screen.getByTestId('up-cell-group-border')).toBeTruthy();
});

it('renders source card header/body/footer and named ReactNode overrides', () => {
  const screen = renderContent(
    <UPCard foot={<Text>Footer</Text>} head={<Text>Custom header</Text>} title="Title">
      <Text>Body</Text>
    </UPCard>,
  );

  expect(screen.getByText('Custom header')).toBeTruthy();
  expect(screen.getByText('Body')).toBeTruthy();
  expect(screen.getByText('Footer')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-card').props.style)).toEqual(
    expect.objectContaining({ borderRadius: 8, margin: 15 }),
  );
});

it('emits source card click events with the card index', () => {
  const onClick = jest.fn();
  const onHeadClick = jest.fn();
  const onBodyClick = jest.fn();
  const onFootClick = jest.fn();
  const screen = renderContent(
    <UPCard
      foot={<Text>Footer</Text>}
      index={7}
      onBodyClick={onBodyClick}
      onClick={onClick}
      onFootClick={onFootClick}
      onHeadClick={onHeadClick}
      showFoot
      showHead
      title="Head"
    />,
  );
  fireEvent.press(screen.getByTestId('up-card'));
  expect(onClick).toHaveBeenCalledWith(7);
  fireEvent.press(screen.getByTestId('up-card-head'));
  expect(onHeadClick).toHaveBeenCalledWith(7);
  fireEvent.press(screen.getByTestId('up-card-body'));
  expect(onBodyClick).toHaveBeenCalledWith(7);
  fireEvent.press(screen.getByTestId('up-card-foot'));
  expect(onFootClick).toHaveBeenCalledWith(7);
});
