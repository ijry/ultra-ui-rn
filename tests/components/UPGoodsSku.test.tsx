import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPGoodsSku, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const skuTree = [
  { name: 'color', label: '颜色', children: [{ id: 1, name: '红' }, { id: 2, name: '蓝' }] },
  { name: 'size', label: '尺寸', children: [{ id: 3, name: '大' }, { id: 4, name: '小' }] },
];

const skuList = [
  { color: 1, size: 3, price: 100, stock: 5 },
  { color: 2, size: 3, price: 120, stock: 3 },
];

it('disables combinations absent from skuList', () => {
  const screen = renderRoot(<UPGoodsSku skuList={skuList} skuTree={skuTree} />);
  fireEvent.press(screen.getByTestId('up-goods-sku-trigger'));
  // 红+小 is absent from skuList
  fireEvent.press(screen.getByTestId('up-goods-sku-leaf-color-1'));
  const small = screen.getByTestId('up-goods-sku-leaf-size-4');
  expect(small.props.accessibilityState?.disabled ?? small.props.disabled).toBe(true);
  // 红+大 exists
  const large = screen.getByTestId('up-goods-sku-leaf-size-3');
  expect(large.props.accessibilityState?.disabled ?? large.props.disabled).toBe(false);
});

it('emits confirm with sku, num and selectedText once fully selected', () => {
  const onConfirm = jest.fn();
  const screen = renderRoot(<UPGoodsSku onConfirm={onConfirm} skuList={skuList} skuTree={skuTree} />);
  fireEvent.press(screen.getByTestId('up-goods-sku-trigger'));
  fireEvent.press(screen.getByTestId('up-goods-sku-leaf-color-1'));
  fireEvent.press(screen.getByTestId('up-goods-sku-leaf-size-3'));
  fireEvent.press(screen.getByTestId('up-goods-sku-confirm'));
  expect(onConfirm).toHaveBeenCalledWith(
    expect.objectContaining({
      sku: expect.objectContaining({ price: 100, stock: 5 }),
      num: 1,
      selectedText: '红, 大',
    }),
  );
});

it('emits open when the trigger is pressed', () => {
  const onOpen = jest.fn();
  const screen = renderRoot(<UPGoodsSku onOpen={onOpen} skuTree={skuTree} />);
  fireEvent.press(screen.getByTestId('up-goods-sku-trigger'));
  expect(onOpen).toHaveBeenCalledTimes(1);
});
