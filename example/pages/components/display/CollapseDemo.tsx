/**
 * Collapse 折叠面板
 * 严格复刻 uview-plus pages/componentsB/collapse/collapse.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { UPCollapse, UPCollapseItem, UPGap, UPIcon } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'Name | Name[]', default: '—', desc: '当前展开项的 name（v-model）' },
  { prop: 'accordion', type: 'boolean', default: 'false', desc: '是否手风琴模式' },
  { prop: 'border', type: 'boolean', default: 'true', desc: '是否显示外边框' },
  { prop: 'onChange', type: '(items) => void', default: '—', desc: '面板状态改变时触发' },
  { prop: 'onOpen', type: '(name) => void', default: '—', desc: '某个面板展开时触发' },
  { prop: 'onClose', type: '(name) => void', default: '—', desc: '某个面板收起时触发' },
];

const DOCS = '涵盖uniapp各个方面，给开发者方向指导和设计理念，让您茅塞顿开，一马平川';
const COMPONENTS = '众多组件覆盖开发过程的各个需求，组件功能丰富，多端兼容。让您快速集成，开箱即用';
const TOOLS = '众多的贴心小工具，是您开发过程中召之即来的利器，让您飞镖在手，百步穿杨';

export default function CollapseDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const log = (label: string, payload: unknown) =>
    setEvents((prev) => [...prev, `${label}: ${JSON.stringify(payload)}`]);

  return (
    <DemoPage>
      <PageItem title="基础功能">
        <UPCollapse
          onChange={(items) => log('change', items)}
          onClose={(name) => log('close', name)}
          onOpen={(name) => log('open', name)}
        >
          <UPCollapseItem name="Docs guide" title="文档指南">
            <Text style={s.content}>{DOCS}</Text>
          </UPCollapseItem>
          <UPCollapseItem name="Variety components" title="组件全面">
            <Text style={s.content}>{COMPONENTS}</Text>
          </UPCollapseItem>
          <UPCollapseItem name="Numerous tools" showRight={false} title="众多利器">
            <Text style={s.content}>{TOOLS}</Text>
          </UPCollapseItem>
        </UPCollapse>
      </PageItem>

      <PageItem title="展开和禁用">
        <UPCollapse value={['2']}>
          <UPCollapseItem title="文档指南">
            <Text style={s.content}>{DOCS}</Text>
          </UPCollapseItem>
          <UPCollapseItem disabled title="组件全面">
            <Text style={s.content}>{COMPONENTS}</Text>
          </UPCollapseItem>
          <UPCollapseItem name="2" title="众多利器">
            <Text style={s.content}>{TOOLS}</Text>
          </UPCollapseItem>
        </UPCollapse>
      </PageItem>

      <PageItem title="手风琴模式">
        <UPCollapse accordion>
          <UPCollapseItem title="文档指南">
            <Text style={s.content}>{DOCS}</Text>
          </UPCollapseItem>
          <UPCollapseItem title="组件全面">
            <Text style={s.content}>{COMPONENTS}</Text>
          </UPCollapseItem>
          <UPCollapseItem title="众多利器">
            <Text style={s.content}>{TOOLS}</Text>
          </UPCollapseItem>
        </UPCollapse>
      </PageItem>

      <PageItem title="移除下划线">
        <UPCollapse accordion border={false}>
          <UPCollapseItem title="文档指南">
            <Text style={s.content}>{DOCS}</Text>
          </UPCollapseItem>
          <UPCollapseItem title="组件全面">
            <Text style={s.content}>{COMPONENTS}</Text>
          </UPCollapseItem>
          <UPCollapseItem title="众多利器">
            <Text style={s.content}>{TOOLS}</Text>
          </UPCollapseItem>
        </UPCollapse>
      </PageItem>

      <PageItem title="自定义标题和内容">
        <UPCollapse accordion>
          <UPCollapseItem titleNode={<Text style={s.slotTitle}>文档指南</Text>}>
            <Text style={s.content}>{DOCS}</Text>
          </UPCollapseItem>
          <UPCollapseItem iconNode={<UPIcon name="tags-fill" size={20} />} title="组件全面">
            <Text style={s.content}>{COMPONENTS}</Text>
          </UPCollapseItem>
          <UPCollapseItem
            icon="tags-fill"
            rightIconNode={<Text style={s.slotTitle}>10</Text>}
            title="众多利器"
          >
            <Text style={s.content}>{TOOLS}</Text>
          </UPCollapseItem>
        </UPCollapse>
      </PageItem>

      <UPGap height={50} />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  content: { color: '#909193', fontSize: 14 },
  slotTitle: { color: '#3c9cff', fontSize: 14 },
});
