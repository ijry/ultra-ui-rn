/**
 * Radio 单选框
 * 严格复刻 uview-plus pages/componentsA/radio/radio.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { UPRadio, UPRadioGroup } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'name', type: 'string | number', default: '—', desc: 'radio 的标识符' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: '形状' },
  { prop: 'size', type: 'number | string', default: '18', desc: '整体的大小' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'labelDisabled', type: 'boolean', default: 'false', desc: '是否禁止点击文本选中' },
  { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '选中状态下的颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#c8c9cc', desc: '未选中的颜色' },
  { prop: 'iconSize', type: 'number | string', default: '12', desc: '图标的大小' },
  { prop: 'label', type: 'string | number', default: '—', desc: 'label 提示文字' },
  { prop: 'iconNode', type: 'ReactNode | (payload) => ReactNode', default: '—', desc: '自定义图标（源 icon 插槽）' },
  { prop: 'labelNode', type: 'ReactNode | (payload) => ReactNode', default: '—', desc: '自定义文本（源 label 插槽）' },
  { prop: 'onChange', type: '(name) => void', default: '—', desc: '选中时触发' },
];

const radiolist1 = ['苹果', '香蕉', '橙子', '榴莲'];
const radiolist2 = ['李白', '韩信', '马可波罗', '百里守约'];
const radiolist3 = ['苹果', '香蕉', '菠萝'];
const radiolist4 = ['3倍镜', '4倍镜', '6倍镜', '8倍镜'];
const radiolist5 = ['红色', '绿色', '蓝色', '黄色'];
const radiolist6 = ['妲己', '虞姬', '不知火舞'];
const radiolist7 = ['可爱', '一般', '不可爱'];

export default function RadioDemo() {
  const [radiovalue1, setRadiovalue1] = useState<string | number | boolean>('苹果');
  const [radiovalue2, setRadiovalue2] = useState<string | number | boolean>('李白');
  const [radiovalue3, setRadiovalue3] = useState<string | number | boolean>('苹果');
  const [radiovalue4, setRadiovalue4] = useState<string | number | boolean>('6倍镜');
  const [radiovalue5, setRadiovalue5] = useState<string | number | boolean>('绿色');
  const [radiovalue6, setRadiovalue6] = useState<string | number | boolean>('妲己');
  const [radiovalue7, setRadiovalue7] = useState<string | number | boolean>('可爱');
  const [events, setEvents] = useState<string[]>([]);
  const groupChange = (n: string | number | boolean) =>
    setEvents((prev) => [...prev, `groupChange: ${String(n)}`]);
  const radioChange = (n: string | number | boolean) =>
    setEvents((prev) => [...prev, `radioChange: ${String(n)}`]);

  return (
    <DemoPage>
      <Section subtitle="苹果、香蕉和橙子哪个最甜？" title="基本案例">
        <UPRadioGroup
          onChange={(next) => { setRadiovalue1(next); groupChange(next); }}
          placement="column"
          value={radiovalue1}
        >
          {radiolist1.map((name) => (
            <UPRadio
              customStyle={s.stacked}
              key={name}
              label={name}
              name={name}
              onChange={radioChange}
            />
          ))}
        </UPRadioGroup>
        <Text>{String(radiovalue1)}</Text>
      </Section>

      <Section subtitle="王者荣耀谁最帅？" title="自定义形状">
        <UPRadioGroup
          onChange={setRadiovalue2}
          placement="column"
          shape="square"
          value={radiovalue2}
        >
          {radiolist2.map((name) => (
            <UPRadio customStyle={s.stacked} key={name} label={name} name={name} />
          ))}
        </UPRadioGroup>
        <Text>{String(radiovalue2)}</Text>
      </Section>

      <Section subtitle="苹果、香蕉和菠萝哪个最甜？" title="是否禁用">
        <UPRadioGroup onChange={setRadiovalue3} placement="column" value={radiovalue3}>
          {radiolist3.map((name, index) => (
            <UPRadio
              customStyle={s.stacked}
              disabled={index === 0}
              key={name}
              label={name}
              name={name}
            />
          ))}
        </UPRadioGroup>
      </Section>

      <Section subtitle="狙击枪用哪个倍镜最好？" title="纵向排列">
        <UPRadioGroup
          labelDisabled
          onChange={setRadiovalue4}
          placement="column"
          value={radiovalue4}
        >
          {radiolist4.map((name) => (
            <UPRadio customStyle={s.stacked} key={name} label={name} name={name} />
          ))}
        </UPRadioGroup>
      </Section>

      <Section subtitle="你比较喜欢下面哪个颜色？" title="自定义颜色？">
        <UPRadioGroup
          activeColor="#19be6b"
          onChange={setRadiovalue5}
          placement="column"
          value={radiovalue5}
        >
          {radiolist5.map((name) => (
            <UPRadio customStyle={s.stacked} key={name} label={name} name={name} />
          ))}
        </UPRadioGroup>
      </Section>

      <Section subtitle="王者荣耀哪个英雄最美？" title="横向排列形式？">
        <UPRadioGroup onChange={setRadiovalue6} placement="row" value={radiovalue6}>
          {radiolist6.map((name) => (
            <UPRadio customStyle={s.inline} key={name} label={name} name={name} />
          ))}
        </UPRadioGroup>
      </Section>

      <Section subtitle="你觉得阿木木可爱吗？" title="横向两端排列形式？">
        <UPRadioGroup
          borderBottom
          iconPlacement="right"
          onChange={setRadiovalue7}
          placement="column"
          value={radiovalue7}
        >
          {radiolist7.map((name) => (
            <UPRadio customStyle={s.stackedWide} key={name} label={name} name={name} />
          ))}
        </UPRadioGroup>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  inline: { marginRight: 16 },
  stacked: { marginBottom: 8 },
  stackedWide: { marginBottom: 16 },
});
