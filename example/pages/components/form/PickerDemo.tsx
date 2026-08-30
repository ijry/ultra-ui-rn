/**
 * UPPicker 组件示例 — 选择器
 * 展示：单列/多列选择、hasInput 模式、ref 级联、自定义 key/value
 */
import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { UPPicker, type UPPickerRef } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const FRUITS = [
  [{ text: '苹果', value: 1 }, { text: '香蕉', value: 2 }, { text: '橘子', value: 3 }, { text: '西瓜', value: 4 }],
];

const PROVINCES = [
  { value: 'guangdong', text: '广东省' },
  { value: 'zhejiang', text: '浙江省' },
  { value: 'jiangsu', text: '江苏省' },
];

const CITIES: Record<string, Array<{ value: string; text: string }>> = {
  guangdong: [{ value: 'guangzhou', text: '广州市' }, { value: 'shenzhen', text: '深圳市' }, { value: 'dongguan', text: '东莞市' }],
  zhejiang: [{ value: 'hangzhou', text: '杭州市' }, { value: 'ningbo', text: '宁波市' }, { value: 'wenzhou', text: '温州市' }],
  jiangsu: [{ value: 'nanjing', text: '南京市' }, { value: 'suzhou', text: '苏州市' }, { value: 'wuxi', text: '无锡市' }],
};

const PROPS = [
  { prop: 'columns', type: 'PickerColumns', default: '[]', desc: '列数据（二维数组）' },
  { prop: 'show', type: 'boolean', default: 'false', desc: '直接控制弹出（v-model:show）' },
  { prop: 'hasInput', type: 'boolean', default: 'false', desc: '输入框触发模式' },
  { prop: 'modelValue', type: 'Primitive[]', default: '—', desc: '受控值（v-model）' },
  { prop: 'placeholder', type: 'string', default: '请选择', desc: '输入框占位文本' },
  { prop: 'showToolbar', type: 'boolean', default: 'true', desc: '显示顶栏（取消/确认）' },
  { prop: 'title', type: 'string', default: '—', desc: '顶栏标题' },
  { prop: 'visibleItemCount', type: 'number | string', default: '5', desc: '可见行数' },
  { prop: 'keyName', type: 'string', default: 'text', desc: '选项显示字段名' },
  { prop: 'onConfirm', type: '(payload) => void', default: '—', desc: '确认回调' },
  { prop: 'onCancel', type: '() => void', default: '—', desc: '取消回调' },
  { prop: 'onChange', type: '(payload) => void', default: '—', desc: '列滚动变化回调' },
];

export default function PickerDemo({ onBack }: DemoProps) {
  const [selected, setSelected] = useState<unknown[]>([]);
  const [selected2, setSelected2] = useState<unknown[]>([]);
  const cascadeRef = useRef<UPPickerRef>(null);
  const [cascadeProv, setCascadeProv] = useState<string>('');
  const [cascadeCity, setCascadeCity] = useState<string>('');
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  const handleCascadeProvince = (val: string) => {
    setCascadeProv(val);
    setCascadeCity('');
    const cities = CITIES[val] ?? [];
    cascadeRef.current?.setColumnValues(1, cities);
  };
  const safeVal = (val: unknown): string => typeof val === 'string' || typeof val === 'number' ? String(val) : '';

  return (
    <DemoPage title="Picker 选择器" onBack={onBack}>
      {/* 1. 单列选择 (hasInput) */}
      <Section title="单列选择（输入框触发）">
        <UPPicker
          hasInput
          columns={FRUITS}
          placeholder="请选择水果"
          title="选择水果"
          onConfirm={(p) => { setSelected(p.value); log(`confirm: ${JSON.stringify(p.value)}`); }}
          onCancel={() => log('cancel')}
        />
        <Value label="已选" value={selected.join(', ')} />
      </Section>

      {/* 2. 多列选择 */}
      <Section title="多列选择">
        <UPPicker
          hasInput
          columns={[
            [{ text: '周一', value: 'mon' }, { text: '周二', value: 'tue' }, { text: '周三', value: 'wed' }],
            [{ text: '上午', value: 'am' }, { text: '下午', value: 'pm' }, { text: '晚上', value: 'eve' }],
          ]}
          placeholder="选择日期和时段"
          title="预约时间"
          onConfirm={(p) => { setSelected2(p.value); log(`multi: ${JSON.stringify(p.value)}`); }}
        />
        <Value label="已选" value={selected2.join(', ')} />
      </Section>

      {/* 3. 级联选择 (ref.setColumnValues) */}
      <Section title="级联选择（省 → 市）">
        <UPPicker
          ref={cascadeRef}
          hasInput
          columns={[PROVINCES, []]}
          placeholder="请选择地区"
          title="地区"
          onConfirm={(p) => { log(`cascade: ${JSON.stringify(p.value)}`); }}
          onChange={(p) => { if (p.columnIndex === 0) handleCascadeProvince(safeVal(p.value[0])); }}
        />
        <Value label="省" value={cascadeProv || '—'} />
        <Value label="市" value={cascadeCity || '—'} />
      </Section>

      {/* 4. 直接弹出（无输入框） */}
      <Section title="直接弹出模式">
        <UPPicker
          show={false}
          columns={FRUITS}
          title="直接弹出"
        />
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
