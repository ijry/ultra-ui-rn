/**
 * UPTable2 组件示例 — 数据表格
 * 展示：基础表格、斑马纹、边框
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPTable2 } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const COLUMNS = [
  { title: '姓名', key: 'name' },
  { title: '年龄', key: 'age' },
  { title: '城市', key: 'city' },
];

const DATA = [
  { name: '张三', age: 28, city: '北京' },
  { name: '李四', age: 35, city: '上海' },
  { name: '王五', age: 22, city: '广州' },
  { name: '赵六', age: 41, city: '深圳' },
];

const PROPS = [
  { prop: 'columns', type: 'UPTable2Column[]', default: '[]', desc: '列定义' },
  { prop: 'data', type: 'any[]', default: '[]', desc: '表格数据' },
  { prop: 'border', type: 'boolean', default: 'true', desc: '是否显示边框' },
  { prop: 'stripe', type: 'boolean', default: 'false', desc: '是否斑马纹' },
  { prop: 'showHeader', type: 'boolean', default: 'true', desc: '是否显示表头' },
  { prop: 'rowKey', type: 'string', default: "'id'", desc: '行唯一标识' },
];

export default function TableDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Table 表格" onBack={onBack}>
      <Section title="基础表格">
        <UPTable2 columns={COLUMNS} data={DATA} border />
      </Section>

      <Section title="斑马纹">
        <UPTable2 columns={COLUMNS} data={DATA} stripe border />
      </Section>

      <Section title="无边框">
        <UPTable2 columns={COLUMNS} data={DATA} border={false} stripe />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
