/**
 * UPTree 组件示例 — 树形控件
 * 展示：基础树、展开/折叠、复选框、手风琴模式
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPTree } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, type DemoProps } from '../_shared';

const TREE_DATA = [
  {
    label: '一级 1', id: '1',
    children: [
      { label: '二级 1-1', id: '1-1', children: [
        { label: '三级 1-1-1', id: '1-1-1' },
        { label: '三级 1-1-2', id: '1-1-2' },
      ]},
      { label: '二级 1-2', id: '1-2' },
    ],
  },
  {
    label: '一级 2', id: '2',
    children: [
      { label: '二级 2-1', id: '2-1' },
      { label: '二级 2-2', id: '2-2' },
    ],
  },
  {
    label: '一级 3', id: '3', children: [],
  },
];

const PROPS = [
  { prop: 'data', type: 'TreeData[]', default: '[]', desc: '树数据' },
  { prop: 'nodeKey', type: 'string', default: "'id'", desc: '节点唯一标识字段' },
  { prop: 'showCheckbox', type: 'boolean', default: 'false', desc: '是否显示复选框' },
  { prop: 'defaultExpandAll', type: 'boolean', default: 'false', desc: '默认展开全部' },
  { prop: 'accordion', type: 'boolean', default: 'false', desc: '手风琴模式' },
  { prop: 'highlightCurrent', type: 'boolean', default: 'false', desc: '高亮当前节点' },
  { prop: 'expandOnClickNode', type: 'boolean', default: 'true', desc: '点击节点时展开' },
  { prop: 'checkOnClickNode', type: 'boolean', default: 'false', desc: '点击节点时勾选' },
];

export default function TreeDemo({ onBack }: DemoProps) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['1']);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  return (
    <DemoPage title="Tree 树形控件" onBack={onBack}>
      <Section title="基础用法">
        <UPTree data={TREE_DATA} defaultExpandAll highlightCurrent />
      </Section>

      <Section title="展开/折叠（受控）">
        <UPTree
          data={TREE_DATA}
          expandedKeys={expandedKeys}
          onNodeExpand={() => {}}
        />
        <Value label="展开" value={expandedKeys.join(', ')} />
      </Section>

      <Section title="复选框">
        <UPTree
          data={TREE_DATA}
          showCheckbox
          defaultExpandAll
          checkedKeys={checkedKeys}
          onCheck={(node, state) => console.log('check:', node, state)}
        />
        <Value label="选中" value={checkedKeys.join(', ')} />
      </Section>

      <Section title="手风琴模式">
        <UPTree data={TREE_DATA} accordion defaultExpandAll />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
