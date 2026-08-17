import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPCoupon, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders amount, unit, title and action text with source defaults', () => {
  const screen = renderRoot(<UPCoupon amount={50} limit="满100可用" title="新人券" time="2026-12-31" />);
  expect(screen.getByTestId('up-coupon-amount')).toHaveTextContent(/￥/);
  expect(screen.getByTestId('up-coupon-amount')).toHaveTextContent(/50/);
  expect(screen.getByTestId('up-coupon-title')).toHaveTextContent(/新人券/);
  expect(screen.getByTestId('up-coupon-action')).toHaveTextContent(/使用/);
  expect(screen.getByTestId('up-coupon')).toHaveTextContent(/满100可用/);
});

it('emits click on press', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPCoupon amount={10} onClick={onClick} />);
  fireEvent.press(screen.getByTestId('up-coupon'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('blocks click when disabled', () => {
  const onClick = jest.fn();
  const screen = renderRoot(<UPCoupon amount={10} disabled onClick={onClick} />);
  fireEvent.press(screen.getByTestId('up-coupon'));
  expect(onClick).not.toHaveBeenCalled();
});
