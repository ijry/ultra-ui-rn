import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { UP, UPRoot, UPTree, type UPTreeRef } from '../../src';
import {
  deriveTreeCheckState,
  expandInitialCheckedKeys,
  flattenVisibleTree,
  normalizeTree,
  toggleCheckedKeys,
  toggleExpandedKeys,
} from '../../src/components/tree/state';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const data = [
  {
    id: 'root',
    label: 'Root',
    children: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B', disabled: true },
    ],
  },
  { id: 'other', label: 'Other' },
];

const fieldNames = {
  children: 'children',
  disabled: 'disabled',
  label: 'label',
  nodeKey: 'id',
} as const;

it('normalizes raw nodes and flattens only expanded descendants', () => {
  const model = normalizeTree(data, fieldNames);

  expect(flattenVisibleTree(model, [])).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ key: 'root', level: 0, hasChildren: true }),
      expect.objectContaining({ key: 'other', level: 0 }),
    ]),
  );
  expect(flattenVisibleTree(model, ['root']).map((row) => row.key)).toEqual([
    'root',
    'a',
    'b',
    'other',
  ]);
});

it('uses path-qualified internal keys for missing or duplicate keys', () => {
  const model = normalizeTree(
    [{ label: 'one' }, { id: 'same', label: 'two' }, { id: 'same', label: 'three' }],
    fieldNames,
  );

  expect(model.visibleKeys).toEqual(['path:0', 'same', 'same@path:2']);
});

it('collects node-level initial flags without mutating source nodes', () => {
  const source = [{
    id: 'root',
    label: 'Root',
    expanded: true,
    checked: true,
    children: [{ id: 'child', label: 'Child' }],
  }];

  const model = normalizeTree(source, fieldNames);

  expect(model.initialExpandedKeys).toEqual(['root']);
  expect(model.initialCheckedKeys).toEqual(['root']);
  expect(source).toEqual([{
    id: 'root',
    label: 'Root',
    expanded: true,
    checked: true,
    children: [{ id: 'child', label: 'Child' }],
  }]);
});

it('allows disabled nodes to expand but still excludes them from check mutations', () => {
  const model = normalizeTree([{
    id: 'disabled',
    label: 'Disabled',
    disabled: true,
    children: [{ id: 'child', label: 'Child' }],
  }], fieldNames);

  expect(toggleExpandedKeys(model, [], 'disabled', true, false)).toEqual(['disabled']);
  expect(toggleCheckedKeys(model, [], 'disabled', true, {
    checkStrictly: false,
  })).toEqual([]);
});

it('preserves initial checked targets and propagates only to enabled descendants', () => {
  const model = normalizeTree([{
    id: 'root',
    label: 'Root',
    disabled: true,
    children: [
      { id: 'enabled', label: 'Enabled' },
      {
        id: 'blocked',
        label: 'Blocked',
        disabled: true,
        children: [{ id: 'nested', label: 'Nested' }],
      },
    ],
  }], fieldNames);

  expect(expandInitialCheckedKeys(model, ['root'], false)).toEqual([
    'root',
    'enabled',
  ]);
});

it('enforces accordion expansion among siblings', () => {
  const model = normalizeTree(
    [{
      id: 'parent',
      label: 'Parent',
      children: [
        { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
        { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
      ],
    }],
    fieldNames,
  );
  expect(toggleExpandedKeys(model, ['parent'], 'parent', false, false)).toEqual([]);
  expect(toggleExpandedKeys(model, ['a', 'b'], 'a', true, true)).toEqual(['a']);
});

it('derives checked and half-checked parent state', () => {
  const model = normalizeTree(
    [{ id: 'root', label: 'Root', children: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] }],
    fieldNames,
  );
  const state = deriveTreeCheckState(model, ['a'], false);

  expect(state.checkedKeys).toEqual(['a']);
  expect(state.halfCheckedKeys).toEqual(['root']);
  expect(state.checkedNodes).toHaveLength(1);
});

it('toggles descendants in non-strict mode and only the target in strict mode', () => {
  const model = normalizeTree(data, fieldNames);

  expect(toggleCheckedKeys(model, [], 'root', true, { checkStrictly: false })).toEqual(['root', 'a']);
  expect(toggleCheckedKeys(model, [], 'root', true, { checkStrictly: true })).toEqual(['root']);
});

it('renders only visible rows and custom node payloads', () => {
  const screen = renderRoot(
    <UPTree
      data={data}
      defaultExpandedKeys={['root']}
      renderNode={({ label, level }) => <Text>{`${level}:${label}`}</Text>}
    />,
  );

  expect(screen.getByTestId('up-tree')).toBeTruthy();
  expect(screen.getByText('0:Root')).toBeTruthy();
  expect(screen.getByText('1:A')).toBeTruthy();
  expect(screen.getByText('1:B')).toBeTruthy();
  expect(screen.getByText('0:Other')).toBeTruthy();
});

it('accepts source props as a field-mapping alias', () => {
  const screen = renderRoot(
    <UPTree
      data={[{
        code: 'root',
        title: 'Root',
        items: [{ code: 'child', title: 'Child' }],
      }]}
      defaultExpandedKeys={['root']}
      props={{ nodeKey: 'code', label: 'title', children: 'items' }}
    />,
  );

  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();
});

it('lets existing fieldNames override the source props alias', () => {
  const screen = renderRoot(
    <UPTree
      data={[{
        code: 'root',
        title: 'Root',
        items: [{ code: 'child', title: 'Child' }],
      }]}
      defaultExpandedKeys={['root']}
      fieldNames={{ nodeKey: 'code', label: 'title', children: 'items' }}
      props={{ nodeKey: 'id', label: 'label', children: 'children' }}
    />,
  );

  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();
});

it('uses source icon props and expands content by default', () => {
  const screen = renderRoot(
    <UPTree
      collapseIcon="source-collapse"
      data={[{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }]}
      expandIcon="source-expand"
    />,
  );

  expect(screen.getByTestId('up-icon-glyph').props.children).toBe('source-expand');
  fireEvent.press(screen.getByTestId('up-tree-content-root'));
  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();
  expect(screen.getByTestId('up-icon-glyph').props.children).toBe('source-collapse');
});

it('uses explicit expandOnClickNode false for non-expanding content presses', () => {
  const screen = renderRoot(
    <UPTree
      data={[{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }]}
      expandOnClickNode={false}
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-root'));
  expect(screen.queryByTestId('up-tree-row-child')).toBeNull();
});

it('dispatches tree content callbacks in source order', () => {
  const events: string[] = [];
  const screen = renderRoot(
    <UPTree
      checkOnClickNode
      data={[{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }]}
      onCheck={() => events.push('check')}
      onCheckChange={() => events.push('check-change')}
      onCurrentChange={() => events.push('current-change')}
      onNodeClick={() => events.push('node-click')}
      onNodeExpand={() => events.push('node-expand')}
      onUpdateCurrentNodeKey={() => events.push('update-current')}
      showCheckbox
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-root'));

  expect(events).toEqual([
    'update-current',
    'node-expand',
    'check-change',
    'check',
    'node-click',
    'current-change',
  ]);
});

it('keeps disabled nodes clickable and expandable but not checkable', () => {
  const onCheckChange = jest.fn();
  const onNodeClick = jest.fn();
  const onNodeExpand = jest.fn();
  const screen = renderRoot(
    <UPTree
      checkOnClickNode
      data={[{
        id: 'disabled',
        label: 'Disabled',
        disabled: true,
        children: [{ id: 'child', label: 'Child' }],
      }]}
      onCheckChange={onCheckChange}
      onNodeClick={onNodeClick}
      onNodeExpand={onNodeExpand}
      showCheckbox
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-disabled'));
  expect(onNodeClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'disabled' }));
  expect(onNodeExpand).toHaveBeenCalledWith(expect.objectContaining({ id: 'disabled' }));
  expect(screen.getByTestId('up-tree-row-child')).toBeTruthy();

  fireEvent.press(screen.getByTestId('up-tree-checkbox-disabled'));
  expect(onCheckChange).not.toHaveBeenCalled();
});

it('merges node flags into uncontrolled initial state but honors controlled keys', () => {
  const source = [{
    id: 'root',
    label: 'Root',
    expanded: true,
    checked: true,
    children: [{ id: 'child', label: 'Child' }],
  }];

  const uncontrolled = renderRoot(
    <UPTree data={source} showCheckbox />,
  );
  expect(uncontrolled.getByTestId('up-tree-row-child')).toBeTruthy();
  expect(uncontrolled.getByTestId('up-tree-checkbox-root').props.accessibilityState.checked).toBe(true);

  const controlled = renderRoot(
    <UPTree checkedKeys={[]} data={source} expandedKeys={[]} showCheckbox />,
  );
  expect(controlled.queryByTestId('up-tree-row-child')).toBeNull();
  expect(controlled.getByTestId('up-tree-checkbox-root').props.accessibilityState.checked).toBe(false);
});

it('emits expand and node-click callbacks', () => {
  const onNodeClick = jest.fn();
  const onNodeExpand = jest.fn();
  const screen = renderRoot(
    <UPTree
      data={data}
      expandOnClickNode={false}
      onNodeClick={onNodeClick}
      onNodeExpand={onNodeExpand}
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-content-root'));
  fireEvent.press(screen.getByTestId('up-tree-expand-root'));

  expect(onNodeClick).toHaveBeenCalledWith(data[0]);
  expect(onNodeExpand).toHaveBeenCalledWith(data[0]);
  expect(screen.getByTestId('up-tree-row-a')).toBeTruthy();
});

it('handles checkbox parent-child state and controlled updates', () => {
  const onCheck = jest.fn();
  const onUpdateCheckedKeys = jest.fn();
  const screen = renderRoot(
    <UPTree
      checkedKeys={[]}
      data={data}
      onCheck={onCheck}
      onUpdateCheckedKeys={onUpdateCheckedKeys}
      showCheckbox
    />,
  );

  fireEvent.press(screen.getByTestId('up-tree-checkbox-root'));

  expect(onUpdateCheckedKeys).toHaveBeenCalledWith(['root', 'a']);
  expect(onCheck).toHaveBeenCalledWith(
    data[0],
    expect.objectContaining({ checkedKeys: ['root', 'a'] }),
  );
  expect(screen.getByTestId('up-tree-checkbox-root').props.accessibilityState.checked).toBe(false);
});

it('supports current-node state and ref methods', async () => {
  const ref = React.createRef<UPTreeRef>();
  const refData = [
    {
      id: 'root',
      label: 'Root',
      children: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
    },
  ];
  const screen = renderRoot(
    <UPTree
      data={refData}
      defaultCheckedKeys={['a']}
      defaultExpandedKeys={['root']}
      ref={ref}
      showCheckbox
    />,
  );

  expect(ref.current?.getCheckedKeys()).toEqual(['a']);
  expect(ref.current?.getHalfCheckedKeys()).toEqual(['root']);
  expect(ref.current?.getCurrentKey()).toBeNull();
  await act(async () => ref.current?.setCurrentKey('a'));
  expect(ref.current?.getCurrentNode()).toBe(refData[0].children[0]);
  expect(ref.current?.scrollToKey('a')).toBe(true);
  expect(ref.current?.scrollToKey('missing')).toBe(false);
  expect(screen.getByTestId('up-tree-row-a')).toBeTruthy();
});

it('merges tree defaults through UP.setConfig', () => {
  act(() => {
    UP.setConfig({ props: { tree: { height: 180, showCheckbox: true } } });
  });

  const screen = renderRoot(<UPTree data={data} />);
  expect(screen.getByTestId('up-tree').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 180 })]),
  );
  expect(screen.getByTestId('up-tree-checkbox-root')).toBeTruthy();
});
