/**
 * Checkbox 复选框
 * 严格复刻 uview-plus pages/componentsA/checkbox/checkbox.nvue
 */
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { UPButton, UPCheckbox, UPCheckboxGroup } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'name', type: 'string | number', default: '—', desc: 'checkbox 的标识符' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '形状' },
  { prop: 'size', type: 'number | string', default: '18', desc: '整体的大小' },
  { prop: 'checked', type: 'boolean', default: 'false', desc: '是否默认选中' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'activeColor', type: 'string', default: '#2979ff', desc: '选中状态下的颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#c8c9cc', desc: '未选中的颜色' },
  { prop: 'iconSize', type: 'number | string', default: '12', desc: '图标的大小' },
  { prop: 'label', type: 'string | number', default: '—', desc: 'label 提示文字' },
  { prop: 'labelDisabled', type: 'boolean', default: 'false', desc: '是否禁止点击文本选中' },
  { prop: 'usedAlone', type: 'boolean', default: 'false', desc: '是否单独使用（不在 group 内）' },
  { prop: 'iconNode', type: 'ReactNode | (payload) => ReactNode', default: '—', desc: '自定义图标（源 icon 插槽）' },
  { prop: 'labelNode', type: 'ReactNode | (payload) => ReactNode', default: '—', desc: '自定义文本（源 label 插槽）' },
  { prop: 'onChange', type: '(checked, payload) => void', default: '—', desc: '选中状态变化时触发' },
];

const checkboxList1 = ['苹果', '香蕉', '橙子'];
const checkboxList2 = ['西游记', '红楼梦', '三国演义', '水浒传'];
const checkboxList3 = ['冬瓜', '西瓜', '黄瓜', '傻瓜'];
const checkboxList4 = ['黄庭坚', '欧阳修', '苏小宝', '王安石'];
const checkboxList5 = ['红色', '黄色', '绿色', '蓝色'];
const checkboxList6 = ['小鸟', '游艇', '轮船', '飞机'];
const checkboxList7 = ['汽车', '蒸汽机', '猪肉', '抄手'];

export default function CheckboxDemo() {
  const [checkboxValue1, setCheckboxValue1] = useState<Array<string | number | boolean>>(['苹果', '橙子']);
  const [aloneChecked, setAloneChecked] = useState(false);
  const [checkboxValue2, setCheckboxValue2] = useState<Array<string | number | boolean>>(['西游记', '红楼梦', '三国演义', '水浒传']);
  const [checkboxValue3, setCheckboxValue3] = useState<Array<string | number | boolean>>(['傻瓜']);
  const [checkboxValue4, setCheckboxValue4] = useState<Array<string | number | boolean>>(['黄庭坚', '欧阳修', '王安石']);
  const [checkboxValue5, setCheckboxValue5] = useState<Array<string | number | boolean>>(['绿色']);
  const [checkboxValue6, setCheckboxValue6] = useState<Array<string | number | boolean>>(['游艇', '轮船']);
  const [checkboxValue7, setCheckboxValue7] = useState<Array<string | number | boolean>>(['汽车', '蒸汽机']);
  const [events, setEvents] = useState<string[]>([]);
  const checkboxChange = (n: Array<string | number | boolean>) =>
    setEvents((prev) => [...prev, `change: ${JSON.stringify(n)}`]);

  return (
    <DemoPage>
      <Section subtitle="苹果、香蕉和橙子哪个最甜？" title="基本案例">
        <UPCheckboxGroup
          onChange={(next) => { setCheckboxValue1(next); checkboxChange(next); }}
          placement="column"
          value={checkboxValue1}
        >
          {checkboxList1.map((name) => (
            <UPCheckbox customStyle={s.stacked} key={name} label={name} name={name} />
          ))}
        </UPCheckboxGroup>
      </Section>

      <Section subtitle="是否同意用户协议？" title="单独使用checkbox">
        <UPCheckbox
          checked={aloneChecked}
          customStyle={s.stacked}
          label="同意用户协议与隐私条款"
          name="agree"
          onChange={setAloneChecked}
          usedAlone
        />
        <UPButton
          customStyle={s.toggleButton}
          onClick={() => setAloneChecked((prev) => !prev)}
          size="small"
          text="切换"
          type="primary"
        />
      </Section>

      <Section subtitle="中国四大名著是？" title="自定义形状">
        <UPCheckboxGroup
          onChange={(next) => { setCheckboxValue2(next); checkboxChange(next); }}
          placement="column"
          shape="square"
          value={checkboxValue2}
        >
          {checkboxList2.map((name) => (
            <UPCheckbox customStyle={s.stacked} key={name} label={name} name={name} />
          ))}
        </UPCheckboxGroup>
      </Section>

      <Section subtitle="下面什么东西不能吃？" title="是否禁用">
        <UPCheckboxGroup
          onChange={(next) => { setCheckboxValue3(next); checkboxChange(next); }}
          placement="column"
          value={checkboxValue3}
        >
          {checkboxList3.map((name, index) => (
            <UPCheckbox
              customStyle={s.stacked}
              disabled={index === 0}
              key={name}
              label={name}
              name={name}
            />
          ))}
        </UPCheckboxGroup>
      </Section>

      <Section subtitle="北宋四大家是谁？" title="是否禁止点击提示语选中复选框">
        <UPCheckboxGroup
          labelDisabled
          onChange={(next) => { setCheckboxValue4(next); checkboxChange(next); }}
          placement="column"
          value={checkboxValue4}
        >
          {checkboxList4.map((name) => (
            <UPCheckbox customStyle={s.stacked} key={name} label={name} name={name} />
          ))}
        </UPCheckboxGroup>
      </Section>

      <Section subtitle="哪个颜色最好看？" title="自定义颜色">
        <UPCheckboxGroup
          activeColor="#19be6b"
          onChange={(next) => { setCheckboxValue5(next); checkboxChange(next); }}
          placement="column"
          value={checkboxValue5}
        >
          {checkboxList5.map((name) => (
            <UPCheckbox customStyle={s.stacked} key={name} label={name} name={name} />
          ))}
        </UPCheckboxGroup>
      </Section>

      <Section subtitle="什么东西不能飞？" title="横向排列形式">
        <UPCheckboxGroup
          onChange={(next) => { setCheckboxValue6(next); checkboxChange(next); }}
          value={checkboxValue6}
        >
          {checkboxList6.map((name) => (
            <UPCheckbox customStyle={s.inline} key={name} label={name} name={name} />
          ))}
        </UPCheckboxGroup>
      </Section>

      <Section subtitle="什么东西不能吃？" title="横向两端排列形式">
        <UPCheckboxGroup
          borderBottom
          iconPlacement="right"
          onChange={(next) => { setCheckboxValue7(next); checkboxChange(next); }}
          placement="column"
          value={checkboxValue7}
        >
          {checkboxList7.map((name) => (
            <UPCheckbox customStyle={s.stackedWide} key={name} label={name} name={name} />
          ))}
        </UPCheckboxGroup>
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
  toggleButton: { width: 120 },
});
