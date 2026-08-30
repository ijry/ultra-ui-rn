/**
 * UPModal 组件示例 — 模态框
 * 展示：基础弹窗、确认/取消、自定义按钮、异步关闭
 */
import React, { useState } from 'react';
import { UPModal } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog, type DemoProps } from '../_shared';
import { Pressable, Text } from 'react-native';

const PROPS = [
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
  { prop: 'title', type: 'string', default: '—', desc: '标题' },
  { prop: 'content', type: 'string', default: '—', desc: '内容文字' },
  { prop: 'showConfirmButton', type: 'boolean', default: 'true', desc: '显示确认按钮' },
  { prop: 'showCancelButton', type: 'boolean', default: 'true', desc: '显示取消按钮' },
  { prop: 'confirmText', type: 'string', default: '确认', desc: '确认按钮文字' },
  { prop: 'cancelText', type: 'string', default: '取消', desc: '取消按钮文字' },
  { prop: 'confirmColor', type: 'string', default: '主题色', desc: '确认按钮颜色' },
  { prop: 'cancelColor', type: 'string', default: '—', desc: '取消按钮颜色' },
  { prop: 'closeOnClickOverlay', type: 'boolean', default: 'true', desc: '点击遮罩关闭' },
  { prop: 'asyncClose', type: 'boolean', default: 'false', desc: '异步关闭模式' },
  { prop: 'asyncCloseTip', type: 'string', default: '—', desc: '异步关闭提示' },
  { prop: 'width', type: 'number | string', default: '—', desc: '弹窗宽度' },
  { prop: 'onConfirm', type: '() => void', default: '—', desc: '确认回调' },
  { prop: 'onCancel', type: '() => void', default: '—', desc: '取消回调' },
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

export default function ModalDemo({ onBack }: DemoProps) {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((p) => [...p, e]);

  return (
    <DemoPage title="Modal 模态框" onBack={onBack}>
      <Section title="基础弹窗">
        <Btn label="打开弹窗" onPress={() => setShow1(true)} />
        <UPModal
          show={show1}
          title="提示"
          content="这是一段弹窗内容"
          onConfirm={() => { setShow1(false); log('confirm'); }}
          onCancel={() => { setShow1(false); log('cancel'); }}
        />
      </Section>

      <Section title="仅确认按钮">
        <Btn label="打开（仅确认）" onPress={() => setShow2(true)} />
        <UPModal
          show={show2}
          title="提示"
          content="只有一个确认按钮"
          showCancelButton={false}
          onConfirm={() => { setShow2(false); log('confirm only'); }}
        />
      </Section>

      <Section title="自定义按钮颜色">
        <Btn label="打开（自定义颜色）" onPress={() => setShow3(true)} />
        <UPModal
          show={show3}
          title="自定义"
          content="确认按钮为绿色"
          confirmColor="#07c160"
          cancelColor="#909399"
          onConfirm={() => { setShow3(false); log('custom confirm'); }}
          onCancel={() => { setShow3(false); log('custom cancel'); }}
        />
      </Section>

      <Section title="异步关闭">
        <Btn label="打开（异步关闭）" onPress={() => setShow4(true)} />
        <UPModal
          show={show4}
          title="异步关闭"
          content="点击确认后会显示 loading，2秒后自动关闭"
          asyncClose
          asyncCloseTip="提交中..."
          onConfirm={() => { log('async confirm...'); setTimeout(() => { setShow4(false); log('async closed'); }, 2000); }}
          onCancel={() => { setShow4(false); log('async cancel'); }}
        />
      </Section>

      <PropsTable rows={PROPS} />
      <EventLog events={events} />
    </DemoPage>
  );
}
