import React, { createRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import {
  UPAgreement,
  UPFloatButton,
  UPNoNetwork,
  type UPAgreementRef,
  UPRoot,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('opens the source agreement modal through its ref and maps agreement actions', () => {
  const ref = createRef<UPAgreementRef>();
  const onConfirm = jest.fn();
  const onProtocolPress = jest.fn();
  const screen = renderRoot(
    <UPAgreement ref={ref} onConfirm={onConfirm} onProtocolPress={onProtocolPress} />,
  );

  act(() => {
    ref.current?.showModal();
  });
  fireEvent.press(screen.getByTestId('up-agreement-protocol'));
  expect(onProtocolPress).toHaveBeenCalledWith('/pages/user_agreement/agreement/info?title=用户协议');
  fireEvent.press(screen.getByTestId('up-modal-confirm'));
  expect(onConfirm).toHaveBeenCalledWith(1);
  expect(screen.queryByTestId('up-modal')).toBeNull();
});

it('renders an explicit disconnected source overlay and maps retry or state callbacks', () => {
  const onRetry = jest.fn();
  const onDisconnected = jest.fn();
  const screen = renderRoot(
    <UPNoNetwork connected={false} onDisconnected={onDisconnected} onRetry={onRetry} />,
  );

  expect(screen.getByTestId('up-no-network')).toBeTruthy();
  expect(onDisconnected).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId('up-no-network-retry'));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it('does not re-report no-network state when the parent re-renders', () => {
  // The effect used to list `input` — the props object, a fresh identity every
  // render — as a dependency, so any parent re-render re-fired onDisconnected /
  // onConnected. A handler that set parent state looped forever, which is why
  // NoNetworkDemo can only wire onRetry.
  const onDisconnected = jest.fn();
  const onConnected = jest.fn();
  const screen = renderRoot(
    <UPNoNetwork connected={false} onConnected={onConnected} onDisconnected={onDisconnected} />,
  );
  expect(onDisconnected).toHaveBeenCalledTimes(1);

  screen.update(
    <UPRoot>
      <UPNoNetwork connected={false} onConnected={onConnected} onDisconnected={onDisconnected} />
    </UPRoot>,
  );
  screen.update(
    <UPRoot>
      <UPNoNetwork connected={false} onConnected={onConnected} onDisconnected={onDisconnected} />
    </UPRoot>,
  );
  expect(onDisconnected).toHaveBeenCalledTimes(1);

  screen.update(
    <UPRoot>
      <UPNoNetwork connected onConnected={onConnected} onDisconnected={onDisconnected} />
    </UPRoot>,
  );
  expect(onConnected).toHaveBeenCalledTimes(1);
  expect(onDisconnected).toHaveBeenCalledTimes(1);
});

it('toggles source float-button menus and emits indexed item payloads', () => {
  const onClick = jest.fn();
  const onItemClick = jest.fn();
  const screen = renderRoot(
    <UPFloatButton
      isMenu
      list={[{ name: 'edit' }, { name: 'delete' }]}
      onClick={onClick}
      onItemClick={onItemClick}
    />,
  );

  fireEvent.press(screen.getByTestId('up-float-button-main'));
  expect(onClick).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId('up-float-button-item-1'));
  expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ index: 1, name: 'delete' }));
});
