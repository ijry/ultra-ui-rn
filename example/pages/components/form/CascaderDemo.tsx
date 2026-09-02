/**
 * Cascader 级联选择
 * 严格复刻 uview-plus pages/componentsD/cascader/cascader.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { UPButton, UPCascader, type UPCascaderValue } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示级联选择器' },
  { prop: 'data', type: 'CascaderNode[]', default: '[]', desc: '级联数据源' },
  { prop: 'modelValue', type: 'CascaderValue[]', default: '[]', desc: '选中路径（v-model）' },
  { prop: 'defaultValue', type: 'CascaderValue[]', default: '—', desc: '默认选中路径' },
  { prop: 'valueKey', type: 'string', default: "'value'", desc: '值字段名' },
  { prop: 'labelKey', type: 'string', default: "'label'", desc: '文字字段名' },
  { prop: 'childrenKey', type: 'string', default: "'children'", desc: '子级字段名' },
  { prop: 'headerDirection', type: "'row' | 'column'", default: "'row'", desc: '头部标签排列方向' },
  { prop: 'optionsCols', type: '1 | 2', default: '2', desc: '选项区域列数' },
  { prop: 'autoClose', type: 'boolean', default: 'true', desc: '选完最后一级后自动关闭' },
  { prop: 'closeable', type: 'boolean', default: 'true', desc: '是否显示关闭按钮' },
  { prop: 'onConfirm', type: '(values) => void', default: '—', desc: '确认选择时触发' },
  { prop: 'onChange', type: '(values) => void', default: '—', desc: '选中项变化时触发' },
];

const areaData = [
  {
    label: '北京市',
    value: '11',
    children: [
      {
        label: '北京市',
        value: '1101',
        children: [
          { label: '东城区', value: '110101' },
          { label: '西城区', value: '110102' },
          { label: '朝阳区', value: '110105' },
        ],
      },
    ],
  },
  {
    label: '广东省',
    value: '44',
    children: [
      {
        label: '广州市',
        value: '4401',
        children: [
          { label: '越秀区', value: '440103' },
          { label: '荔湾区', value: '440103' },
          { label: '海珠区', value: '440105' },
        ],
      },
      {
        label: '深圳市',
        value: '4403',
        children: [
          { label: '罗湖区', value: '440303' },
          { label: '福田区', value: '440304' },
        ],
      },
    ],
  },
];

const categoryData = [
  {
    label: '服装',
    value: '1',
    children: [
      {
        label: '上装',
        value: '1-1',
        children: [
          { label: 'T恤', value: '1-1-1' },
          { label: '衬衫', value: '1-1-2' },
        ],
      },
      {
        label: '下装',
        value: '1-2',
        children: [
          { label: '裤子', value: '1-2-1' },
          { label: '裙子', value: '1-2-2' },
        ],
      },
    ],
  },
  {
    label: '数码',
    value: '2',
    children: [
      {
        label: '手机',
        value: '2-1',
        children: [
          { label: '智能手机', value: '2-1-1' },
          { label: '功能手机', value: '2-1-2' },
        ],
      },
      {
        label: '电脑',
        value: '2-2',
        children: [
          { label: '笔记本', value: '2-2-1' },
          { label: '台式机', value: '2-2-2' },
        ],
      },
    ],
  },
];

const orgData = [
  {
    name: '总部',
    id: '1',
    childs: [
      {
        name: '研发部',
        id: '1-1',
        childs: [
          { name: '前端组', id: '1-1-1' },
          { name: '后端组', id: '1-1-2' },
        ],
      },
      {
        name: '市场部',
        id: '1-2',
        childs: [
          { name: '销售组', id: '1-2-1' },
          { name: '推广组', id: '1-2-2' },
        ],
      },
    ],
  },
];

const defaultCategory: UPCascaderValue[] = ['2', '2-2'];

const formatResult = (result: readonly UPCascaderValue[]) =>
  result.length === 0 ? '' : result.join(' / ');

export default function CascaderDemo() {
  const [show1, setShow1] = useState(false);
  const [result1, setResult1] = useState<UPCascaderValue[]>([]);
  const [show2, setShow2] = useState(false);
  const [result2, setResult2] = useState<UPCascaderValue[]>([]);
  const [show3, setShow3] = useState(false);
  const [result3, setResult3] = useState<UPCascaderValue[]>([]);
  const [show4, setShow4] = useState(false);
  const [result4, setResult4] = useState<UPCascaderValue[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const log = (label: string, values: readonly UPCascaderValue[]) =>
    setEvents((prev) => [...prev, `${label}: ${formatResult(values)}`]);

  return (
    <DemoPage>
      <PageItem title="基础用法">
        <UPButton onClick={() => setShow1(true)} text="选择地区" />
        {result1.length > 0 ? (
          <Text style={s.result}>已选择：{formatResult(result1)}</Text>
        ) : null}
        <UPCascader
          data={areaData}
          modelValue={result1}
          onChangeShow={setShow1}
          onConfirm={(values) => { setResult1(values); log('confirm', values); }}
          show={show1}
          valueKey="label"
        />
      </PageItem>

      <PageItem title="带默认值">
        <UPButton onClick={() => setShow2(true)} text="选择商品分类" />
        {result2.length > 0 ? (
          <Text style={s.result}>已选择：{formatResult(result2)}</Text>
        ) : null}
        <UPCascader
          data={categoryData}
          headerDirection="column"
          modelValue={defaultCategory}
          onChangeShow={setShow2}
          onConfirm={(values) => { setResult2(values); log('confirm', values); }}
          show={show2}
        />
      </PageItem>

      <PageItem title="自定义字段名">
        <UPButton onClick={() => setShow3(true)} text="选择组织架构" />
        {result3.length > 0 ? (
          <Text style={s.result}>已选择：{formatResult(result3)}</Text>
        ) : null}
        <UPCascader
          childrenKey="childs"
          data={orgData}
          labelKey="name"
          onChangeShow={setShow3}
          onConfirm={(values) => { setResult3(values); log('confirm', values); }}
          show={show3}
          valueKey="id"
        />
      </PageItem>

      <PageItem title="垂直头部及单列选项">
        <UPButton onClick={() => setShow4(true)} text="选择商品分类" />
        {result4.length > 0 ? (
          <Text style={s.result}>已选择：{formatResult(result4)}</Text>
        ) : null}
        <UPCascader
          data={categoryData}
          headerDirection="column"
          modelValue={defaultCategory}
          onChangeShow={setShow4}
          onConfirm={(values) => { setResult4(values); log('confirm', values); }}
          optionsCols={1}
          show={show4}
        />
      </PageItem>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  result: { marginTop: 10 },
});
