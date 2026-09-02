/**
 * Tree 树形控件
 * 严格复刻 uview-plus pages/componentsD/tree/tree.nvue
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPButton, UPTree, type UPTreeRef } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'data', type: 'T[]', default: '[]', desc: '树形数据' },
  { prop: 'props', type: 'object', default: '—', desc: '字段映射（label / children / nodeKey / disabled）' },
  { prop: 'defaultExpandedKeys', type: 'UPKey[]', default: '[]', desc: '默认展开的节点 key' },
  { prop: 'defaultExpandAll', type: 'boolean', default: 'false', desc: '是否默认展开全部节点' },
  { prop: 'showCheckbox', type: 'boolean', default: 'false', desc: '是否显示复选框' },
  { prop: 'defaultCheckedKeys', type: 'UPKey[]', default: '[]', desc: '默认勾选的节点 key' },
  { prop: 'checkOnClickNode', type: 'boolean', default: 'false', desc: '点击节点是否切换勾选' },
  { prop: 'expandOnClickNode', type: 'boolean', default: 'true', desc: '点击节点是否展开收起' },
  { prop: 'accordion', type: 'boolean', default: 'false', desc: '是否手风琴模式' },
  { prop: 'highlightCurrent', type: 'boolean', default: 'false', desc: '是否高亮当前节点' },
  { prop: 'indent', type: 'number', default: '16', desc: '相邻层级的缩进距离' },
  { prop: 'renderNode', type: '(payload) => ReactNode', default: '—', desc: '自定义节点内容（源默认插槽）' },
  { prop: 'onNodeClick', type: '(node) => void', default: '—', desc: '点击节点时触发' },
  { prop: 'onCheck', type: '(node, state) => void', default: '—', desc: '勾选变化后触发，回传选中状态' },
];

type TreeNode = {
  id: string;
  label: string;
  tag?: string;
  disabled?: boolean;
  children?: TreeNode[];
};

const defaultProps = {
  label: 'label',
  children: 'children',
  nodeKey: 'id',
  disabled: 'disabled',
};

const treeData: TreeNode[] = [
  {
    id: '1',
    label: '一级 1',
    children: [
      {
        id: '1-1',
        label: '二级 1-1',
        children: [
          { id: '1-1-1', label: '三级 1-1-1' },
          { id: '1-1-2', label: '三级 1-1-2' },
        ],
      },
      { id: '1-2', label: '二级 1-2' },
    ],
  },
  {
    id: '2',
    label: '一级 2',
    children: [
      { id: '2-1', label: '二级 2-1' },
      { id: '2-2', label: '二级 2-2' },
    ],
  },
];

const customTreeData: TreeNode[] = [
  {
    id: 'custom-1',
    label: '设计资源',
    tag: '目录',
    children: [
      { id: 'custom-1-1', label: '组件规范', tag: '文档' },
      { id: 'custom-1-2', label: '图标资产', tag: '资源' },
    ],
  },
];

const checkTreeData: TreeNode[] = [
  {
    id: '2',
    label: '表单组件',
    children: [
      {
        id: '2-1',
        label: '输入组件',
        children: [
          { id: '2-1-1', label: 'Input 输入框' },
          { id: '2-1-2', label: 'Textarea 文本域' },
        ],
      },
      {
        id: '2-2',
        label: '选择组件',
        children: [
          { id: '2-2-1', label: 'Select 选择器' },
          { id: '2-2-2', label: 'Picker 选择器', disabled: true },
        ],
      },
    ],
  },
];

const accordionTreeData: TreeNode[] = [
  {
    id: 'a',
    label: '导航组件',
    children: [
      { id: 'a-1', label: 'Navbar 导航栏' },
      { id: 'a-2', label: 'Tabbar 底部导航栏' },
    ],
  },
  {
    id: 'b',
    label: '反馈组件',
    children: [
      { id: 'b-1', label: 'Toast 消息提示' },
      { id: 'b-2', label: 'Notify 通知' },
    ],
  },
];

export default function TreeDemo() {
  const checkTree = useRef<UPTreeRef<TreeNode>>(null);
  const [checkedKeysText, setCheckedKeysText] = useState('2-1-1');
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((prev) => [...prev, e]);

  const setCheckedKeys = () => {
    checkTree.current?.setCheckedKeys(['2-1-2', '2-2-1']);
    setCheckedKeysText((checkTree.current?.getCheckedKeys() ?? []).join('、'));
  };

  const getCheckedKeys = () => {
    setCheckedKeysText((checkTree.current?.getCheckedKeys() ?? []).join('、'));
  };

  return (
    <DemoPage>
      <PageItem title="基础用法">
        <UPTree
          currentNodeKey="1"
          data={treeData}
          defaultExpandedKeys={['1']}
          highlightCurrent
          onNodeClick={(node) => log(`点击节点: ${node.label}`)}
          onNodeExpand={(node) => log(`展开节点: ${node.label}`)}
          props={defaultProps}
        />
      </PageItem>

      <PageItem title="自定义节点">
        <UPTree
          data={customTreeData}
          defaultExpandAll
          indent={40}
          onNodeClick={(node) => log(`点击节点: ${node.label}`)}
          props={defaultProps}
          renderNode={({ node, level, expanded, hasChildren }) => (
            <View style={s.customNode}>
              <Text style={s.customLabel}>{node.label}</Text>
              {node.tag ? <Text style={s.customTag}>{node.tag}</Text> : null}
              {hasChildren ? (
                <Text style={s.customState}>
                  {`${expanded ? '已展开' : '已收起'} · ${level}级`}
                </Text>
              ) : null}
            </View>
          )}
        />
      </PageItem>

      <PageItem title="复选框">
        <UPTree
          checkOnClickNode
          data={checkTreeData}
          defaultCheckedKeys={['2-1-1']}
          defaultExpandAll
          onCheck={(_node, state) => setCheckedKeysText(state.checkedKeys.join('、'))}
          onCheckChange={(node, checked) => log(`勾选状态变化: ${node.label} ${checked}`)}
          props={defaultProps}
          ref={checkTree}
          showCheckbox
        />
        <View style={s.actions}>
          <View style={s.actionButton}>
            <UPButton onClick={setCheckedKeys} size="mini" text="设置选中" type="primary" />
          </View>
          <View style={s.actionButton}>
            <UPButton onClick={getCheckedKeys} size="mini" text="读取选中" />
          </View>
        </View>
        <Text style={s.result}>当前选中：{checkedKeysText}</Text>
      </PageItem>

      <PageItem title="手风琴模式">
        <UPTree
          accordion
          data={accordionTreeData}
          expandOnClickNode
          onNodeClick={(node) => log(`点击节点: ${node.label}`)}
          props={defaultProps}
        />
      </PageItem>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  actionButton: { marginRight: 8, width: 75 },
  actions: { flexDirection: 'row', marginTop: 8 },
  customLabel: { color: '#303133', fontSize: 14 },
  customNode: { alignItems: 'center', flexDirection: 'row', minWidth: 0 },
  customState: { color: '#909193', fontSize: 11, marginLeft: 6 },
  customTag: {
    backgroundColor: '#ecf5ff',
    borderRadius: 999,
    color: '#3c9cff',
    fontSize: 11,
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  result: { color: '#606266', fontSize: 13, marginTop: 6 },
});
