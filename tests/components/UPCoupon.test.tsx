import React from 'react';
import { Text } from 'react-native';
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

it('renders amountNode slot as render-prop', () => {
  const screen = renderRoot(<UPCoupon amount={99} amountNode={(amt) => <Text testID="custom-amt">{amt} OFF</Text>} />);
  expect(screen.getByTestId('custom-amt')).toHaveTextContent(/99 OFF/);
});

it('renders titleNode slot as render-prop', () => {
  const screen = renderRoot(<UPCoupon amount={10} title="VIP" titleNode={(t) => <Text testID="custom-title">【{t}】</Text>} />);
  expect(screen.getByTestId('custom-title')).toHaveTextContent(/【VIP】/);
});

it('applies circle radius to action button', () => {
  const screen = renderRoot(<UPCoupon amount={20} circle />);
  const action = screen.getByTestId('up-coupon-action');
  expect(action.props.style).toMatchObject({ borderRadius: 25 });
});

it('applies square radius to action button when circle=false', () => {
  const screen = renderRoot(<UPCoupon amount={20} circle={false} />);
  const action = screen.getByTestId('up-coupon-action');
  expect(action.props.style).toMatchObject({ borderRadius: 3 });
});

