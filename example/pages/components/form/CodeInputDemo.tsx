/**
 * CodeInput 验证码输入
 * 严格复刻 uview-plus pages/componentsC/codeInput/codeInput.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPCodeInput } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'string | number', default: '—', desc: '输入的值（v-model）' },
  { prop: 'maxlength', type: 'number | string', default: '6', desc: '最大输入长度' },
  { prop: 'dot', type: 'boolean', default: 'false', desc: '是否用圆点代替文字' },
  { prop: 'mode', type: "'box' | 'line'", default: "'box'", desc: '显示模式（box 方框 / line 横线）' },
  { prop: 'hairline', type: 'boolean', default: 'false', desc: '是否细边框' },
  { prop: 'space', type: 'number | string', default: '10', desc: '字符间的距离' },
  { prop: 'focus', type: 'boolean', default: 'false', desc: '是否自动获取焦点' },
  { prop: 'bold', type: 'boolean', default: 'false', desc: '字体和输入横线是否加粗' },
  { prop: 'color', type: 'string', default: '#606266', desc: '字体颜色' },
  { prop: 'fontSize', type: 'number | string', default: '18', desc: '字体大小' },
  { prop: 'size', type: 'number | string', default: '35', desc: '输入框的大小' },
  { prop: 'borderColor', type: 'string', default: '#c9cacc', desc: '边框和线条颜色' },
  { prop: 'onChange', type: '(value) => void', default: '—', desc: '输入内容变化时触发' },
  { prop: 'onFinish', type: '(value) => void', default: '—', desc: '输入长度达到 maxlength 时触发' },
];

export default function CodeInputDemo() {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [value3, setValue3] = useState('');
  const [value4, setValue4] = useState('');
  const [value5, setValue5] = useState('');
  const [value6, setValue6] = useState('');
  const [value7, setValue7] = useState('');
  const [value8, setValue8] = useState('');
  const [value9, setValue9] = useState('123');
  const [value10, setValue10] = useState('34');
  const [events, setEvents] = useState<string[]>([]);
  const change = (e: string) => setEvents((prev) => [...prev, `change: ${e}`]);
  const finish = (e: string) => setEvents((prev) => [...prev, `finish: ${e}`]);

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPCodeInput
          maxlength={4}
          onChange={(next) => { setValue1(next); change(next); }}
          onFinish={finish}
          value={value1}
        />
      </Section>

      <Section title="横线模式">
        <UPCodeInput bold maxlength={4} mode="line" onChange={setValue2} value={value2} />
      </Section>

      <Section title="设置长度">
        <UPCodeInput maxlength={6} onChange={setValue3} value={value3} />
      </Section>

      <Section title="设置间距">
        <UPCodeInput maxlength={4} mode="box" onChange={setValue4} space={0} value={value4} />
      </Section>

      <Section title="细边框">
        <UPCodeInput
          hairline
          maxlength={4}
          mode="box"
          onChange={setValue5}
          space={0}
          value={value5}
        />
        <View style={s.spaced}>
          <UPCodeInput
            hairline
            maxlength={4}
            mode="line"
            onChange={setValue6}
            space={10}
            value={value6}
          />
        </View>
      </Section>

      <Section title="调整颜色">
        <UPCodeInput
          borderColor="#f56c6c"
          color="#f56c6c"
          hairline
          maxlength={4}
          mode="box"
          onChange={setValue7}
          space={0}
          value={value7}
        />
        <View style={s.spaced}>
          <UPCodeInput
            borderColor="#3c9cff"
            color="#3c9cff"
            hairline
            maxlength={4}
            mode="line"
            onChange={setValue10}
            size="30"
            value={value10}
          />
        </View>
      </Section>

      <Section title="点模式">
        <UPCodeInput
          dot
          hairline
          maxlength={4}
          mode="box"
          onChange={setValue8}
          space={0}
          value={value8}
        />
      </Section>

      <Section title="预置内容">
        <UPCodeInput
          fontSize="17"
          hairline
          maxlength={4}
          mode="box"
          onChange={setValue9}
          space={0}
          value={value9}
        />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  spaced: { marginTop: 10 },
});
