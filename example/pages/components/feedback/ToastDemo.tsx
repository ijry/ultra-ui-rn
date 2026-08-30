/**
 * UPToast 组件示例 — 轻提示
 * 展示：不同类型、位置、加载中、自定义时长
 */
import React, { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { UPToast, type UPToastRef } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'message', type: 'string | number', default: '—', desc: '提示文字' },
  { prop: 'type', type: 'success | error | warning | info | loading | default', default: 'default', desc: '提示类型' },
  { prop: 'icon', type: 'boolean | string', default: '—', desc: '自定义图标' },
  { prop: 'position', type: 'top | center | bottom', default: 'center', desc: '显示位置' },
  { prop: 'duration', type: 'number | string', default: '2000', desc: '持续时间(ms)' },
  { prop: 'loading', type: 'boolean', default: 'false', desc: '加载中状态' },
  { prop: 'overlay', type: 'boolean', default: 'false', desc: '显示遮罩' },
];

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: '#3c9cff', borderRadius: 6, marginBottom: 8, paddingVertical: 10, paddingHorizontal: 16 }}
    >
      <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

export default function ToastDemo({ onBack }: DemoProps) {
  const toastRef = useRef<UPToastRef>(null);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  const show = (opts: { message: string; type?: string; position?: string; duration?: number; loading?: boolean }) => {
    toastRef.current?.show(opts as any);
    log(`show: ${opts.message}`);
  };

  return (
    <DemoPage title="Toast 轻提示" onBack={onBack}>
      <UPToast ref={toastRef} />

      <Section title="不同类型">
        <Btn label="✅ 成功" onPress={() => show({ message: '操作成功', type: 'success' })} />
        <Btn label="❌ 错误" onPress={() => show({ message: '操作失败', type: 'error' })} />
        <Btn label="⚠️ 警告" onPress={() => show({ message: '请注意', type: 'warning' })} />
        <Btn label="ℹ️ 信息" onPress={() => show({ message: '提示信息', type: 'info' })} />
        <Btn label="纯文字" onPress={() => show({ message: '这是一段文字' })} />
      </Section>

      <Section title="位置">
        <Btn label="顶部" onPress={() => show({ message: '顶部提示', position: 'top' })} />
        <Btn label="中间" onPress={() => show({ message: '中间提示', position: 'center' })} />
        <Btn label="底部" onPress={() => show({ message: '底部提示', position: 'bottom' })} />
      </Section>

      <Section title="加载中">
        <Btn label="加载中 (3秒)" onPress={() => show({ message: '加载中...', loading: true, duration: 3000 })} />
      </Section>

      <Section title="自定义时长">
        <Btn label="持续5秒" onPress={() => show({ message: '持续5秒', duration: 5000 })} />
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
