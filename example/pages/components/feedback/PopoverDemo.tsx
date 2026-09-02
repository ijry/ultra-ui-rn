/**
 * Popover 气泡弹出框
 * 严格复刻 uview-plus pages/componentsC/popover/popover.vue
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPButton, UPPopover } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'text', type: 'string | number', default: '—', desc: '气泡内的文字' },
  { prop: 'color', type: 'string', default: '#606266', desc: '文字颜色' },
  { prop: 'bgColor', type: 'string', default: 'transparent', desc: '触发区域背景色' },
  { prop: 'popupBgColor', type: 'string', default: '#000000', desc: '气泡背景色' },
  { prop: 'direction', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", desc: '气泡弹出方向' },
  { prop: 'triggerMode', type: "'longpress' | 'click'", default: "'click'", desc: '触发方式' },
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示气泡（v-model）' },
  { prop: 'forcePosition', type: 'object', default: '—', desc: '强制指定气泡位置' },
  { prop: 'trigger', type: 'ReactNode', default: '—', desc: '自定义触发器（源 trigger 插槽）' },
  { prop: 'content', type: 'ReactNode', default: '—', desc: '自定义气泡内容（源 content 插槽）' },
  { prop: 'onOpen', type: '() => void', default: '—', desc: '气泡打开时触发' },
  { prop: 'onClose', type: '() => void', default: '—', desc: '气泡关闭时触发' },
];

export default function PopoverDemo() {
  return (
    <DemoPage>
      <Section contentStyle={s.topPad} title="右侧弹出">
        <UPPopover
          bgColor="#e3e4e6"
          color="#333"
          content={<View style={s.contentSlot}><Text>自定义内容</Text></View>}
          direction="right"
          popupBgColor="#f7f7f7"
          trigger={<UPButton customStyle={s.triggerButton} text="点击" type="primary" />}
        />
      </Section>

      <Section contentStyle={s.alignEnd} direction="row" title="左侧弹出及强制定位">
        <UPPopover
          bgColor="#333"
          color="#fff"
          content={<View style={s.contentSlot}><Text>自定义内容</Text></View>}
          direction="left"
          forcePosition={{ right: '108px', top: '0px' }}
          popupBgColor="#333"
          trigger={<UPButton customStyle={s.triggerButton} text="点击" type="primary" />}
        />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  alignEnd: { justifyContent: 'flex-end', paddingTop: 10 },
  contentSlot: { paddingHorizontal: 12, paddingVertical: 6 },
  topPad: { paddingTop: 10 },
  triggerButton: { width: 100 },
});
