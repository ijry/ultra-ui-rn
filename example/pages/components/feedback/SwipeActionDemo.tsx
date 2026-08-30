/**
 * UPSwipeAction 组件示例 — 滑动操作
 * 复刻 uview-plus u-swipe-action 页面结构
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPSwipeAction, UPSwipeActionItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'autoClose', type: 'boolean', default: 'false', desc: '操作后自动关闭' },
  { prop: 'opendItem', type: 'boolean', default: 'false', desc: '是否打开' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '内容' },
  { prop: 'onUpdateOpendItem', type: '(open) => void', default: '—', desc: '打开状态变化' },
];

export default function SwipeActionDemo({ onBack }: DemoProps) {
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="SwipeAction 滑动操作" onBack={onBack}>
      <Section title="基础用法">
        <UPSwipeActionItem
          options={[{ text: '删除', style: { backgroundColor: '#ee0a24', color: '#fff' } }]}
          closeOnClick
          onClick={() => setEvents((e) => [...e, 'delete'])}
        >
          <View style={sa.item}>
            <Text>左滑显示删除按钮</Text>
          </View>
        </UPSwipeActionItem>
      </Section>

      <Section title="多个操作按钮">
        <UPSwipeActionItem
          options={[
            { text: '收藏', style: { backgroundColor: '#07c160', color: '#fff' } },
            { text: '删除', style: { backgroundColor: '#ee0a24', color: '#fff' } },
          ]}
          closeOnClick
          onClick={(name) => setEvents((e) => [...e, `click: ${name}`])}
        >
          <View style={sa.item}>
            <Text>左滑显示多个按钮</Text>
          </View>
        </UPSwipeActionItem>
      </Section>

      <Section title="多行滑动">
        {['列表项 1', '列表项 2', '列表项 3'].map((text, i) => (
          <UPSwipeActionItem
            key={i}
            options={[{ text: '删除', style: { backgroundColor: '#ee0a24', color: '#fff' } }]}
            closeOnClick
            onClick={() => setEvents((e) => [...e, `delete: ${text}`])}
          >
            <View style={sa.item}>
              <Text>{text}</Text>
            </View>
          </UPSwipeActionItem>
        ))}
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const sa = StyleSheet.create({
  item: { height: 50, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
});
