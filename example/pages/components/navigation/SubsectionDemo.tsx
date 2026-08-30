/**
 * UPSubsection 组件示例 — 分段控制器
 * 展示：基础用法、受控、按钮模式、自定义颜色、禁用
 */
import React, { useState } from 'react';
import { UPSubsection } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'list', type: 'Array<string | number | object>', default: '[]', desc: '选项数据' },
  { prop: 'current', type: 'number | string', default: '0', desc: '当前索引（v-model）' },
  { prop: 'mode', type: 'button | subsection', default: 'button', desc: '模式' },
  { prop: 'activeColor', type: 'string', default: '#3c9cff', desc: '激活颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#303133', desc: '未激活颜色' },
  { prop: 'fontSize', type: 'number | string', default: '12', desc: '字体大小' },
  { prop: 'bold', type: 'boolean', default: 'false', desc: '激活项加粗' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'onChange', type: '(index: number) => void', default: '—', desc: '切换回调' },
];

export default function SubsectionDemo({ onBack }: DemoProps) {
  const [current, setCurrent] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="Subsection 分段控制器" onBack={onBack}>
      <Section title="基础用法">
        <UPSubsection
          list={['周一', '周二', '周三', '周四', '周五']}
          current={current}
          onChange={(i) => { setCurrent(i); log(`onChange: ${i}`); }}
        />
        <Value label="当前" value={current} />
      </Section>

      <Section title="subsection 模式">
        <UPSubsection
          list={['全部', '待付款', '待发货', '已发货']}
          mode="subsection"
          current={1}
        />
      </Section>

      <Section title="自定义颜色">
        <UPSubsection
          list={['选项A', '选项B', '选项C']}
          activeColor="#07c160"
          current={0}
        />
      </Section>

      <Section title="加粗激活项">
        <UPSubsection
          list={['标签1', '标签2', '标签3']}
          bold
          current={1}
        />
      </Section>

      <Section title="禁用">
        <UPSubsection list={['禁用1', '禁用2']} disabled current={0} />
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
