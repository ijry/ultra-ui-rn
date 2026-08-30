/**
 * UPCellGroup 组件示例 — 单元格分组
 * 复刻 uview-plus u-cell-group 页面结构
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPCellGroup, UPCell } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'title', type: 'string', default: '—', desc: '分组标题' },
 { prop: 'border', type: 'boolean', default: 'true', desc: '是否显示外边框' },
 { prop: 'titleNode', type: 'ReactNode', default: '—', desc: '自定义标题节点' },
 { prop: 'children', type: 'ReactNode', default: '—', desc: '单元格内容' },
];

export default function CellGroupDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPCellGroup title="分组标题">
 <UPCell title="单元格" value="内容" />
 <UPCell title="单元格" value="内容" isLink />
 </UPCellGroup>
 </Section>

 <Section title="无标题">
 <UPCellGroup>
 <UPCell title="单元格" value="内容" />
 <UPCell title="单元格" value="内容" isLink />
 </UPCellGroup>
 </Section>

 <Section title="无边框">
 <UPCellGroup title="无边框" border={false}>
 <UPCell title="单元格" value="内容" />
 <UPCell title="单元格" value="内容" isLink />
 </UPCellGroup>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
