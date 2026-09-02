/**
 * Tooltip 长按提示
 * 严格复刻 uview-plus pages/componentsC/tooltip/tooltip.vue
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPButton, UPTooltip } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'text', type: 'string | number', default: '—', desc: '需要显示的文字' },
  { prop: 'copyText', type: 'string | number', default: '—', desc: '点击复制时实际复制的文本' },
  { prop: 'size', type: 'number | string', default: '14', desc: '字体大小' },
  { prop: 'color', type: 'string', default: '#606266', desc: '文字颜色' },
  { prop: 'bgColor', type: 'string', default: 'transparent', desc: '选中文字的背景色' },
  { prop: 'popupBgColor', type: 'string', default: '#000000', desc: '气泡背景色' },
  { prop: 'direction', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", desc: '气泡弹出方向' },
  { prop: 'buttons', type: 'string[]', default: '[]', desc: '扩展按钮组' },
  { prop: 'overlay', type: 'boolean', default: 'true', desc: '是否显示遮罩' },
  { prop: 'showCopy', type: 'boolean', default: 'true', desc: '是否显示复制按钮' },
  { prop: 'triggerMode', type: "'longpress' | 'click'", default: "'longpress'", desc: '触发方式' },
  { prop: 'singleton', type: 'boolean', default: 'false', desc: '是否同时只能打开一个气泡' },
  { prop: 'forcePosition', type: 'object', default: '—', desc: '强制指定气泡位置' },
  { prop: 'trigger', type: 'ReactNode', default: '—', desc: '自定义触发器（源 trigger 插槽）' },
  { prop: 'content', type: 'ReactNode', default: '—', desc: '自定义气泡内容（源 content 插槽）' },
  { prop: 'onClick', type: '(index: number) => void', default: '—', desc: '点击扩展按钮时触发' },
];

export default function TooltipDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const click = (index: number) => setEvents((prev) => [...prev, `index ${index}`]);

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPTooltip overlay text="长按文本，上方提示" />
      </Section>

      <Section contentStyle={s.bottomPad} title="下方显示">
        <UPTooltip direction="bottom" text="长按文本，下方提示" />
      </Section>

      <Section title="扩展按钮">
        <UPTooltip buttons={['扩展']} onClick={click} text="显示多个扩展按钮" />
      </Section>

      <Section title="自动调整位置">
        <UPTooltip buttons={['扩展', '搜索', '翻译']} text="自动调整气泡位置" />
      </Section>

      <Section title="高亮选中文本背景色">
        <UPTooltip
          bgColor="#e3e4e6"
          buttons={['扩展', '搜索', '翻译']}
          direction="top"
          text="长按文本，显示背景色"
          triggerMode="click"
        />
      </Section>

      <Section direction="row" title="单例打开">
        <UPTooltip singleton text="第一个" triggerMode="click" />
        <UPTooltip customStyle={s.spacedLeft} singleton text="第二个" triggerMode="click" />
      </Section>

      <Section title="自定义触发器">
        <UPTooltip
          bgColor="#e3e4e6"
          color="#333"
          content={<View style={s.contentSlot}><Text>自定义内容</Text></View>}
          direction="right"
          popupBgColor="#f7f7f7"
          text="长按文本，显示背景色"
          trigger={<UPButton customStyle={s.triggerButton} text="点击" type="primary" />}
          triggerMode="click"
        />
      </Section>

      <Section contentStyle={s.alignEnd} direction="row" title="左侧弹出">
        <UPTooltip
          bgColor="#333"
          color="#fff"
          content={<View style={s.contentSlot}><Text>自定义内容</Text></View>}
          direction="left"
          forcePosition={{ right: '108px', top: '0px' }}
          popupBgColor="#333"
          text="长按文本，显示背景色"
          trigger={<UPButton customStyle={s.triggerButton} text="点击" type="primary" />}
          triggerMode="click"
        />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  alignEnd: { justifyContent: 'flex-end' },
  bottomPad: { paddingBottom: 30 },
  contentSlot: { paddingHorizontal: 12, paddingVertical: 6 },
  spacedLeft: { marginLeft: 12 },
  triggerButton: { width: 100 },
});
