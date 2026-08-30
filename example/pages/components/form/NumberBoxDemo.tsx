/**
 * UPNumberBox 组件示例 — 数字输入
 * 展示：基础用法、受控、范围限制、步长、禁用、自定义颜色
 */
import React, { useState } from 'react';
import { UPNumberBox } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'number | string', default: '—', desc: '受控值（v-model）' },
  { prop: 'min', type: 'number | string', default: '0', desc: '最小值' },
  { prop: 'max', type: 'number | string', default: '99', desc: '最大值' },
  { prop: 'step', type: 'number | string', default: '1', desc: '步长' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'integer', type: 'boolean', default: 'false', desc: '只允许整数' },
  { prop: 'decimalLength', type: 'number | string | null', default: 'null', desc: '小数位数' },
  { prop: 'showMinus', type: 'boolean', default: 'true', desc: '显示减号按钮' },
  { prop: 'showPlus', type: 'boolean', default: 'true', desc: '显示加号按钮' },
  { prop: 'buttonSize', type: 'number | string', default: '28', desc: '按钮大小' },
  { prop: 'inputWidth', type: 'number | string', default: '35', desc: '输入框宽度' },
  { prop: 'onChange', type: '(value, name) => void', default: '—', desc: '值变化回调' },
  { prop: 'onOverlimit', type: '(type) => void', default: '—', desc: '达到边界回调' },
];

export default function NumberBoxDemo({ onBack }: DemoProps) {
  const [v1, setV1] = useState(1);
  const [v2, setV2] = useState(5);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="NumberBox 数字输入" onBack={onBack}>
      <Section title="基础用法">
        <Row label="当前值">
          <Value label="" value={v1} />
        </Row>
        <UPNumberBox
          value={v1}
          onChange={(val) => { setV1(val); log(`onChange: ${val}`); }}
          onOverlimit={(type) => log(`overlimit: ${type}`)}
        />
      </Section>

      <Section title="范围限制 (1-10, 步长2)">
        <UPNumberBox min={1} max={10} step={2} value={v2} onChange={setV2} />
        <Value label="当前值" value={v2} />
      </Section>

      <Section title="自定义大小">
        <UPNumberBox buttonSize={36} inputWidth={50} buttonWidth={40} buttonRadius={8} />
      </Section>

      <Section title="只显示 +/- 按钮（隐藏输入框）">
        <UPNumberBox disabledInput />
      </Section>

      <Section title="禁用">
        <UPNumberBox value={5} disabled />
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
