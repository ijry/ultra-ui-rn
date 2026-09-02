/**
 * Subsection 分段器
 * 严格复刻 uview-plus pages/componentsC/subsection/subsection.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPSubsection } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'list', type: 'Array<string | number | object>', default: '[]', desc: '选项数据' },
  { prop: 'current', type: 'number | string', default: '0', desc: '当前选中项索引（v-model）' },
  { prop: 'mode', type: "'button' | 'subsection'", default: "'button'", desc: '模式选择' },
  { prop: 'activeColor', type: 'string', default: '#303133', desc: '激活时的颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#303133', desc: '未激活时的颜色' },
  { prop: 'fontSize', type: 'number | string', default: '12', desc: '字体大小' },
  { prop: 'bold', type: 'boolean', default: 'true', desc: '激活选项是否加粗' },
  { prop: 'bgColor', type: 'string', default: '#eeeeef', desc: 'mode 为 button 时的背景色' },
  { prop: 'keyName', type: 'string', default: "'name'", desc: 'list 为对象数组时的文字字段名' },
  { prop: 'activeColorKeyName', type: 'string', default: '—', desc: 'list 中激活色的字段名' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'onChange', type: '(index: number) => void', default: '—', desc: '选项切换时触发' },
];

const list = ['未付款', '待评价', '已付款'];

const list3 = [
  { name: '禁用', textColor: '#FF4D4D' },
  { name: '启用', textColor: '#00CC88' },
  { name: '未激活文字', inactiveColorKey: 'pink' },
];

export default function SubsectionDemo() {
  const [current1, setCurrent1] = useState(0);
  const [current2, setCurrent2] = useState(0);
  const [current3, setCurrent3] = useState(0);
  const [current4, setCurrent4] = useState(1);
  const [current5, setCurrent5] = useState(0);

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPSubsection current={current1} list={list} mode="subsection" onChange={setCurrent1} />
      </Section>

      <Section title="按钮模式">
        <UPSubsection current={current2} list={list} mode="button" onChange={setCurrent2} />
      </Section>

      <Section title="更换主题">
        <UPSubsection
          activeColor="#f56c6c"
          current={current3}
          list={list}
          mode="subsection"
          onChange={setCurrent3}
        />
      </Section>

      <Section title="默认位置">
        <UPSubsection
          activeColor="#f9ae3d"
          current={current4}
          list={list}
          mode="button"
          onChange={setCurrent4}
        />
      </Section>

      <Section title="按钮模式通过list自定义颜色">
        <UPSubsection
          activeColorKeyName="textColor"
          current={current5}
          list={list3}
          mode="button"
          onChange={setCurrent5}
        />
      </Section>

      <Section title="禁用">
        <UPSubsection
          activeColorKeyName="textColor"
          current={current5}
          disabled
          list={list3}
          mode="button"
          onChange={setCurrent5}
        />
        <View style={s.spaced}>
          <UPSubsection
            current={current1}
            disabled
            list={list}
            mode="subsection"
            onChange={setCurrent1}
          />
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  spaced: { marginTop: 10 },
});
