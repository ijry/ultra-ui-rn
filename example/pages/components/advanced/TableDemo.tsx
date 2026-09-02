/**
 * Table 表格
 * 严格复刻 uview-plus pages/componentsB/table/table.nvue
 */
import React, { useState } from 'react';
import { UPTable, UPTd, UPTh, UPTr } from 'ultra-ui-rn';
import { DemoPage, ParamPanel, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'borderColor', type: 'string', default: '#e4e7ed', desc: '表格边框颜色' },
  { prop: 'align', type: "'left' | 'center' | 'right'", default: "'center'", desc: '单元格对齐方式' },
  { prop: 'padding', type: 'number | string', default: '—', desc: '单元格内边距' },
  { prop: 'fontSize', type: 'number | string', default: '—', desc: '字体大小' },
  { prop: 'color', type: 'string', default: '—', desc: '字体颜色' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '表格背景色' },
  { prop: 'thStyle', type: 'TextStyle', default: '—', desc: '表头样式' },
  { prop: 'width', type: 'number | string', default: '—', desc: '列宽（Th / Td）' },
];

const BORDER_COLORS = ['#e4e7ed', '#2979ff', '#ff9900'];
const ALIGNS = ['left', 'center', 'right'] as const;

const rows = [
  ['吕布', '22', '楚河', '男'],
  ['项羽', '28', '汉界', '男'],
  ['木兰', '24', '南国', '女'],
];

export default function TableDemo() {
  const [borderColor, setBorderColor] = useState(BORDER_COLORS[0]!);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');

  return (
    <DemoPage>
      <Section title="演示效果">
        <UPTable align={align} borderColor={borderColor}>
          <UPTr>
            <UPTh>姓名</UPTh>
            <UPTh>年龄</UPTh>
            <UPTh>籍贯</UPTh>
            <UPTh>性别</UPTh>
          </UPTr>
          {rows.map((row) => (
            <UPTr key={row[0]}>
              {row.map((cell, index) => (
                <UPTd key={`${row[0]}-${index}`}>{cell}</UPTd>
              ))}
            </UPTr>
          ))}
        </UPTable>
      </Section>

      <Section title="边框颜色">
        <ParamPanel
          current={BORDER_COLORS.indexOf(borderColor)}
          label=""
          onChange={(index) => setBorderColor(BORDER_COLORS[index] ?? BORDER_COLORS[0]!)}
          options={['gray', 'primary', 'warning']}
        />
      </Section>

      <Section title="对齐方式">
        <ParamPanel
          current={ALIGNS.indexOf(align)}
          label=""
          onChange={(index) => setAlign(ALIGNS[index] ?? 'center')}
          options={['左', '中', '右']}
        />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
