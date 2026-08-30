/**
 * UPCell 组件示例 — 单元格
 * 展示：基础、图标、右侧内容、箭头、禁用、居中、必填
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPCell, UPCellGroup } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'title', type: 'string | number', default: '—', desc: '左侧标题' },
  { prop: 'label', type: 'string | number', default: '—', desc: '标题下方说明' },
  { prop: 'value', type: 'string | number', default: '—', desc: '右侧内容' },
  { prop: 'icon', type: 'string', default: '—', desc: '左侧图标' },
  { prop: 'rightIcon', type: 'string', default: '—', desc: '右侧图标' },
  { prop: 'isLink', type: 'boolean', default: 'false', desc: '显示右侧箭头' },
  { prop: 'clickable', type: 'boolean', default: 'false', desc: '可点击样式' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'center', type: 'boolean', default: 'false', desc: '垂直居中' },
  { prop: 'border', type: 'boolean', default: 'true', desc: '显示底部边框' },
  { prop: 'required', type: 'boolean', default: 'false', desc: '显示必填标记' },
];

export default function CellDemo({ onBack }: DemoProps) {
  const [clicks, setClicks] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="Cell 单元格" onBack={onBack}>
      <Section title="基础用法">
        <UPCellGroup>
          <UPCell title="单元格" value="内容" />
          <UPCell title="单元格" value="内容" />
        </UPCellGroup>
      </Section>

      <Section title="带图标">
        <UPCellGroup>
          <UPCell title="我的" icon="account" isLink />
          <UPCell title="设置" icon="setting" isLink />
          <UPCell title="消息" icon="bell" isLink />
        </UPCellGroup>
      </Section>

      <Section title="标题 + 描述 + 箭头">
        <UPCell
          title="收货地址"
          label="广东省深圳市南山区科技园"
          isLink
          onClick={() => { log('click: 收货地址'); setClicks((c) => c + 1); }}
        />
        <Value label="点击次数" value={clicks} />
      </Section>

      <Section title="右侧内容">
        <UPCellGroup>
          <UPCell title="价格" value="¥99.00" />
          <UPCell title="状态" value="已完成" rightIcon="checkmark-circle" />
        </UPCellGroup>
      </Section>

      <Section title="禁用">
        <UPCell title="禁用单元格" disabled />
      </Section>

      <Section title="必填标记">
        <UPCell title="用户名" required value="请输入" isLink />
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
