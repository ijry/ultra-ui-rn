/**
 * Input 输入框
 * 严格复刻 uview-plus pages/componentsC/input/input.nvue
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  UPButton,
  UPCode,
  UPGap,
  UPInput,
  UPText,
  toast,
  type UPCodeRef,
} from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'string | number', default: '—', desc: '输入的值（v-model）' },
  { prop: 'type', type: "'text' | 'number' | 'idcard' | 'digit'", default: "'text'", desc: '输入框类型' },
  { prop: 'placeholder', type: 'string', default: '—', desc: '占位提示文字' },
  { prop: 'border', type: "'surround' | 'bottom' | 'none'", default: "'surround'", desc: '边框类型' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '输入框形状' },
  { prop: 'clearable', type: 'boolean', default: 'false', desc: '是否显示清除控件' },
  { prop: 'onlyClearableOnFocused', type: 'boolean', default: 'true', desc: '仅聚焦时显示清除图标' },
  { prop: 'password', type: 'boolean', default: 'false', desc: '是否密码类型' },
  { prop: 'passwordVisibilityToggle', type: 'boolean', default: 'false', desc: '是否显示密码显隐切换' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
  { prop: 'color', type: 'string', default: '#303133', desc: '输入框字体颜色' },
  { prop: 'prefixIcon', type: 'string', default: '—', desc: '输入框前置图标' },
  { prop: 'suffixIcon', type: 'string', default: '—', desc: '输入框后置图标' },
  { prop: 'prefix', type: 'ReactNode', default: '—', desc: '前置插槽内容（源 prefix 插槽）' },
  { prop: 'suffix', type: 'ReactNode', default: '—', desc: '后置插槽内容（源 suffix 插槽）' },
  { prop: 'confirmType', type: 'string', default: "'done'", desc: '键盘右下角按钮的文字' },
  { prop: 'onChange', type: '(value: string) => void', default: '—', desc: '内容变化时触发' },
  { prop: 'onConfirm', type: '(value: string) => void', default: '—', desc: '点击键盘确认按钮时触发' },
];

export default function InputDemo() {
  const [value, setValue] = useState('');
  const [inputNumber, setInputNumber] = useState('');
  const [inputPassword, setInputPassword] = useState('123456');
  const [tips, setTips] = useState('');
  const codeRef = useRef<UPCodeRef>(null);
  const [events, setEvents] = useState<string[]>([]);
  const change = (e: string) => setEvents((prev) => [...prev, `change: ${e}`]);

  const handleSearch = (e: string) => {
    toast.default('@confirm触发');
    setEvents((prev) => [...prev, `confirm: ${e}`]);
  };

  const getCode = () => {
    toast.loading('正在获取验证码');
    setTimeout(() => {
      toast.hide();
      toast.default('验证码已发送');
      codeRef.current?.start();
    }, 2000);
  };

  return (
    <DemoPage>
      <Section title="基础使用">
        <Text>{value}</Text>
        <UPInput
          border="surround"
          confirmType="search"
          onChange={(next) => { setValue(next); change(next); }}
          onConfirm={handleSearch}
          placeholder="请输入内容"
          value={value}
        />
        <UPButton customStyle={s.spaced} onClick={() => setValue(Math.random().toString())} text="变化" />
        <Text>{value}</Text>
      </Section>

      <Section title="颜色">
        <UPInput
          border="surround"
          color="blue"
          onChange={setValue}
          placeholder="请输入内容"
          value={value}
        />
      </Section>

      <Section title="可清空内容(仅focus时显示清除图标)">
        <UPInput border="surround" clearable placeholder="请输入内容" />
      </Section>

      <Section title="可清空内容(始终显示清除图标)">
        <UPInput border="surround" clearable onlyClearableOnFocused={false} placeholder="请输入内容" />
      </Section>

      <Section title="数字键盘">
        <UPInput
          border="surround"
          clearable
          onChange={setInputNumber}
          placeholder="请输入内容"
          type="number"
          value={inputNumber}
        />
        <Text>{inputNumber}</Text>
      </Section>

      <Section title="密码类型">
        <UPInput
          border="surround"
          clearable
          onChange={setInputPassword}
          password
          passwordVisibilityToggle
          placeholder="请输入内容"
          value={inputPassword}
        />
        <Text>{inputPassword}</Text>
      </Section>

      <Section title="显示下划线">
        <UPInput border="bottom" clearable placeholder="请输入内容" />
      </Section>

      <Section title="禁用状态">
        <UPInput border="surround" disabled placeholder="禁用状态" />
      </Section>

      <Section title="圆形">
        <UPInput border="surround" placeholder="请输入内容" shape="circle" />
      </Section>

      <Section title="前后图标">
        <UPInput placeholder="前置图标" prefixIcon="search" prefixIconStyle={s.prefixIcon} />
        <View style={s.spaced}>
          <UPInput placeholder="后置图标" suffixIcon="map-fill" suffixIconStyle={s.suffixIcon} />
        </View>
      </Section>

      <Section title="前后插槽">
        <UPInput
          placeholder="前置插槽"
          prefix={<UPText customStyle={s.prefixText} text="http://" type="tips" />}
        />
        <View style={s.spaced}>
          <UPInput
            placeholder="后置插槽"
            suffix={
              <View style={s.suffixSlot}>
                <UPCode changeText="X秒重新获取哈哈哈" onChange={setTips} ref={codeRef} seconds="20" />
                <UPButton onClick={getCode} size="mini" text={tips} type="success" />
              </View>
            }
          />
        </View>
      </Section>

      <UPGap height={50} />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  prefixIcon: { color: '#909399', fontSize: 22 },
  prefixText: { marginRight: 3 },
  spaced: { marginTop: 15 },
  suffixIcon: { color: '#909399' },
  suffixSlot: { alignItems: 'center', flexDirection: 'row' },
});
