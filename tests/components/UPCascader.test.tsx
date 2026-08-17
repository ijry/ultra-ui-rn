import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UPCascader, UPRoot } from '../../src';
import {
  createCascaderState,
  selectCascaderNode,
} from '../../src/components/cascader/cascader-data';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const data = [
  { code: 'zj', name: 'Zhejiang', nodes: [{ code: 'hz', name: 'Hangzhou' }, { code: 'nb', name: 'Ningbo' }] },
  { code: 'gd', name: 'Guangdong', nodes: [{ code: 'sz', name: 'Shenzhen' }] },
] as const;

const keys = { childrenKey: 'nodes', labelKey: 'name', valueKey: 'code' };

it('recovers a configured key path and discards descendants when its branch changes', () => {
  const initial = createCascaderState(data, ['zj', 'hz'], keys);
  expect(initial.indexs).toEqual([0, 0]);
  const next = selectCascaderNode(initial, 0, 1, keys);
  expect(next.indexs).toEqual([1]);
  expect(next.levels[1]).toEqual([{ code: 'sz', name: 'Shenzhen' }]);
});

it('keeps a leaf draft until explicit confirmation and closes in source callback order', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPCascader
      {...keys}
      data={data}
      onChange={(values) => events.push(`change:${values.join('/')}`)}
      onChangeShow={(show) => events.push(`show:${show}`)}
      onConfirm={(values) => events.push(`confirm:${values.join('/')}`)}
      onUpdateModelValue={(values) => events.push(`update:${values.join('/')}`)}
      show
    />,
  );

  fireEvent.press(screen.getByTestId('up-cascader-option-0-0'));
  fireEvent.press(screen.getByTestId('up-cascader-option-1-1'));
  expect(events).toEqual(['change:zj/nb']);
  fireEvent.press(screen.getByTestId('up-cascader-confirm'));
  expect(events).toEqual(['change:zj/nb', 'update:zj/nb', 'confirm:zj/nb', 'show:false']);
});

it('supports one-column and vertical headers, cancellation, and auto confirmation', () => {
  const onCancel = jest.fn();
  const screen = renderRoot(
    <UPCascader
      {...keys}
      autoClose
      data={data}
      headerDirection="column"
      maskCloseAble={false}
      onCancel={onCancel}
      optionsCols={1}
      show
    />,
  );

  expect(screen.getByTestId('up-cascader-column-0')).toBeTruthy();
  expect(screen.queryByTestId('up-cascader-column-1')).toBeNull();
  expect(screen.getByTestId('up-cascader-header-column')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-cascader-cancel'));
  expect(onCancel).toHaveBeenCalledTimes(1);
});

it('auto closes after a leaf and accepts unmatched controlled paths', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPCascader
      {...keys}
      autoClose
      data={data}
      modelValue={['missing']}
      onChange={(values) => events.push(`change:${values.join('/')}`)}
      onChangeShow={(show) => events.push(`show:${show}`)}
      onConfirm={(values) => events.push(`confirm:${values.join('/')}`)}
      onUpdateModelValue={(values) => events.push(`update:${values.join('/')}`)}
      show
    />,
  );

  fireEvent.press(screen.getByTestId('up-cascader-option-0-1'));
  fireEvent.press(screen.getByTestId('up-cascader-option-1-0'));
  expect(events).toEqual(['change:gd/sz', 'update:gd/sz', 'confirm:gd/sz', 'show:false']);
});
