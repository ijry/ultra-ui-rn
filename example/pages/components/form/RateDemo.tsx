/**
 * Rate 评分
 * 严格复刻 uview-plus pages/componentsA/rate/rate.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPRate } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'number | string', default: '0', desc: '选中的星星数量（v-model）' },
  { prop: 'count', type: 'number | string', default: '5', desc: '最多可选的星星数量' },
  { prop: 'size', type: 'number | string', default: '18', desc: '星星的大小' },
  { prop: 'minCount', type: 'number | string', default: '0', desc: '最少可选的星星数量' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁止用户操作' },
  { prop: 'readonly', type: 'boolean', default: 'false', desc: '是否只读' },
  { prop: 'activeColor', type: 'string', default: '#f9ae3d', desc: '选中时的星星颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#b2b2b2', desc: '未选中时的星星颜色' },
  { prop: 'gutter', type: 'number | string', default: '4', desc: '星星之间的距离' },
  { prop: 'allowHalf', type: 'boolean', default: 'false', desc: '是否允许半星选择' },
  { prop: 'activeIcon', type: 'string', default: 'star-fill', desc: '选中时的图标名' },
  { prop: 'inactiveIcon', type: 'string', default: 'star', desc: '未选中时的图标名' },
  { prop: 'touchable', type: 'boolean', default: 'true', desc: '是否可以通过滑动手势选择评分' },
  { prop: 'onChange', type: '(value: number) => void', default: '—', desc: '选中的星星数量改变时触发' },
];

export default function RateDemo() {
  const [value, setValue] = useState(3);
  const [value1, setValue1] = useState(2);
  const [activeColorValue, setActiveColorValue] = useState(3);
  const [halfValue, setHalfValue] = useState(3.5);
  const [activeIconValue, setActiveIconValue] = useState(3);
  const [events, setEvents] = useState<string[]>([]);
  const change = (e: number) => setEvents((prev) => [...prev, `change: ${e}`]);

  return (
    <DemoPage>
      <Section title="基本案例">
        <View style={s.item}>
          <UPRate size="20" />
        </View>
      </Section>

      <Section title="自定义选中星星数量">
        <View style={s.item}>
          <UPRate
            onChange={(next) => { setValue(next); change(next); }}
            size="20"
            value={value}
          />
        </View>
      </Section>

      <Section title="自定义星星大小">
        <View style={s.item}>
          <UPRate count="4" size="30" />
        </View>
      </Section>

      <Section title="是否禁用评分">
        <View style={s.item}>
          <UPRate disabled size="20" />
        </View>
      </Section>

      <Section title="是否只读评分">
        <View style={s.item}>
          <UPRate readonly size="20" />
        </View>
      </Section>

      <Section title="自定义选中星星颜色">
        <View style={s.item}>
          <UPRate
            activeColor="#2979ff"
            onChange={setActiveColorValue}
            size="20"
            value={activeColorValue}
          />
        </View>
      </Section>

      <Section title="自定义未选中星星颜色">
        <View style={s.item}>
          <UPRate
            inactiveColor="#2979ff"
            onChange={setValue1}
            size="20"
            value={value1}
          />
        </View>
      </Section>

      <Section title="禁止触摸选择">
        <View style={s.item}>
          <UPRate size="20" touchable={false} />
        </View>
      </Section>

      <Section title="允许触摸选择">
        <View style={s.item}>
          <UPRate size="20" touchable />
        </View>
      </Section>

      <Section title="是否允许半星">
        <View style={s.item}>
          <UPRate
            allowHalf
            onChange={(next) => { setHalfValue(next); change(next); }}
            size="20"
            value={halfValue}
          />
        </View>
      </Section>

      <Section title="自定义选中的图标">
        <View style={s.item}>
          <UPRate
            activeIcon="heart-fill"
            inactiveIcon="heart"
            onChange={setActiveIconValue}
            size="20"
            value={activeIconValue}
          />
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row' },
});
