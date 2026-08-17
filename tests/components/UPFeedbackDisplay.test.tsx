import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPActionSheet, UPLoadingIcon, UPLoadingPage, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('emits the source action payload and requests close', () => {
  const action = { name: 'Delete' };
  const onSelect = jest.fn();
  const onChangeShow = jest.fn();
  const onClose = jest.fn();
  const screen = renderRoot(
    <UPActionSheet actions={[action]} onChangeShow={onChangeShow} onClose={onClose} onSelect={onSelect} show />,
  );

  fireEvent.press(screen.getByTestId('up-action-sheet-action-0'));
  expect(onSelect).toHaveBeenCalledWith(action);
  expect(onChangeShow).toHaveBeenCalledWith(false);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('renders source loading text and loading page visibility', () => {
  const screen = renderRoot(
    <>
      <UPLoadingIcon text="Loading" />
      <UPLoadingPage loading loadingText="Fetching" />
    </>,
  );

  expect(screen.getByText('Loading')).toBeTruthy();
  expect(screen.getByText('Fetching')).toBeTruthy();
  expect(screen.getByTestId('up-loading-page')).toBeTruthy();
});
