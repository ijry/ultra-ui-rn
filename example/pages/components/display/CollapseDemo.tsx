/**
 * UPCollapse 组件示例 — 折叠面板
 * 展示：基础折叠、手风琴模式、自定义内容
 */
import React, { useState } from 'react';
import { Text } from 'react-native';
import { UPCollapse, UPCollapseItem } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'Name | Name[] | null', default: 'null', desc: '当前展开项（v-model）' },
  { prop: 'accordion', type: 'boolean', default: 'false', desc: '手风琴模式（只展开一个）' },
  { prop: 'border', type: 'boolean', default: 'true', desc: '显示外边框' },
];

export default function CollapseDemo({ onBack }: DemoProps) {
  const [active, setActive] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="Collapse 折叠面板" onBack={onBack}>
      <Section title="手风琴模式（同时只展开一个）">
        <UPCollapse accordion onChange={(items) => log(`accordion: ${JSON.stringify(items)}`)}>
          <UPCollapseItem title="商品详情" name="1">
            <Text style={{ color: '#606266', lineHeight: 22 }}>
              这是商品的详细信息，包括规格、材质、产地等。{'\n'}可以放任意 React 内容。
            </Text>
          </UPCollapseItem>
          <UPCollapseItem title="用户评价" name="2">
            <Text style={{ color: '#606266', lineHeight: 22 }}>
              用户评价内容区域。好评率 98%。
            </Text>
          </UPCollapseItem>
          <UPCollapseItem title="售后服务" name="3">
            <Text style={{ color: '#606266', lineHeight: 22 }}>
              7天无理由退换，1年质保。
            </Text>
          </UPCollapseItem>
        </UPCollapse>
      </Section>

      <Section title="多选模式">
        <UPCollapse value={active} onChange={(items) => { setActive(items.map(i => String(i))); log(`multi: ${JSON.stringify(items)}`); }}>
          <UPCollapseItem title="选项一" name="a">
            <Text style={{ color: '#606266' }}>选项一的内容</Text>
          </UPCollapseItem>
          <UPCollapseItem title="选项二" name="b">
            <Text style={{ color: '#606266' }}>选项二的内容</Text>
          </UPCollapseItem>
          <UPCollapseItem title="选项三" name="c">
            <Text style={{ color: '#606266' }}>选项三的内容</Text>
          </UPCollapseItem>
        </UPCollapse>
        <Value label="展开项" value={JSON.stringify(active)} />
      </Section>

      <Section title="禁用项">
        <UPCollapse accordion>
          <UPCollapseItem title="可展开" name="ok">
            <Text style={{ color: '#606266' }}>正常内容</Text>
          </UPCollapseItem>
          <UPCollapseItem title="禁用" name="disabled" disabled>
            <Text style={{ color: '#606266' }}>不可展开</Text>
          </UPCollapseItem>
        </UPCollapse>
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
