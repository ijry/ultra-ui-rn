/**
 * BackTop 返回顶部
 * 严格复刻 uview-plus pages/componentsA/backtop/backtop.nvue
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { UPBackTop, UPCheckbox, UPCheckboxGroup, UPGap } from 'ultra-ui-rn';
import { Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'mode', type: "'circle' | 'square'", default: "'circle'", desc: '按钮形状' },
  { prop: 'icon', type: 'string', default: "'arrow-upward'", desc: '图标名' },
  { prop: 'text', type: 'string', default: '—', desc: '按钮文字，与 icon 二选一' },
  { prop: 'duration', type: 'number | string', default: '100', desc: '返回顶部的滚动时长' },
  { prop: 'scrollTop', type: 'number', default: '0', desc: '页面当前滚动距离' },
  { prop: 'top', type: 'number | string', default: '400', desc: '滚动超过此距离才显示按钮' },
  { prop: 'bottom', type: 'number | string', default: '100', desc: '距底部距离' },
  { prop: 'right', type: 'number | string', default: '20', desc: '距右侧距离' },
  { prop: 'iconStyle', type: 'TextStyle', default: '—', desc: '图标样式' },
  { prop: 'onClick', type: '() => void', default: '—', desc: '点击按钮时触发' },
];

const checkboxList = ['显示方形', '自定义图标', '自定义距离', '自定义样式', '自定义返回顶部滚动时间'];

export default function BackTopDemo() {
  // 源默认勾选「自定义图标」（onMounted 里也把 icon 设成 arrow-up）。
  const [value, setValue] = useState<Array<string | number | boolean>>(['自定义图标']);
  const [scrollTop, setScrollTop] = useState(0);
  const [events, setEvents] = useState<string[]>([]);

  const has = (name: string) => value.includes(name);

  const backTopData = {
    mode: has('显示方形') ? ('square' as const) : ('circle' as const),
    icon: has('自定义图标') ? 'arrow-up' : 'arrow-upward',
    bottom: has('自定义距离') ? 300 : 100,
    right: 20,
    duration: has('自定义返回顶部滚动时间') ? 1500 : 300,
    customStyle: has('自定义样式') ? s.customButton : undefined,
    iconStyle: has('自定义样式') ? s.customIcon : undefined,
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollTop(event.nativeEvent.contentOffset.y);
  };

  return (
    <View style={s.page}>
      <ScrollView
        contentContainerStyle={s.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={s.scroll}
      >
        <Section title="自定义backTop(滚动页面即可在右下角看到图标)">
          <View style={s.item}>
            <UPCheckboxGroup onChange={setValue} placement="column" shape="square" value={value}>
              {checkboxList.map((name) => (
                <UPCheckbox customStyle={s.checkbox} key={name} label={name} name={name} />
              ))}
            </UPCheckboxGroup>
          </View>
        </Section>

        {/* 源页 .u-page 固定 height: 1200px 以便滚动，这里用等高 Gap。 */}
        <UPGap height={1200} />

        <EventLog events={events} />
        <PropsTable rows={PROPS} />
      </ScrollView>

      <UPBackTop
        bottom={backTopData.bottom}
        customStyle={backTopData.customStyle}
        duration={backTopData.duration}
        icon={backTopData.icon}
        iconStyle={backTopData.iconStyle}
        mode={backTopData.mode}
        onClick={() => setEvents((prev) => [...prev, 'click'])}
        right={backTopData.right}
        scrollTop={scrollTop}
      />
    </View>
  );
}

const s = StyleSheet.create({
  checkbox: { marginBottom: 8 },
  content: { paddingBottom: 40, paddingHorizontal: 15, paddingTop: 15 },
  customButton: { backgroundColor: '#2979ff' },
  customIcon: { color: '#ffffff' },
  item: { marginTop: 10 },
  page: { backgroundColor: '#f7f8fa', flex: 1 },
  scroll: { flex: 1 },
});
