/**
 * Code 验证码倒计时
 * 严格复刻 uview-plus pages/componentsB/code/code.nvue
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { UPButton, UPCode, toast, type UPCodeRef } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'seconds', type: 'number | string', default: '60', desc: '倒计时所需的秒数' },
  { prop: 'startText', type: 'string', default: "'获取验证码'", desc: '开始前的提示语' },
  { prop: 'changeText', type: 'string', default: "'X秒重新获取'", desc: '倒计时期间的提示语（X 为秒数占位）' },
  { prop: 'endText', type: 'string', default: "'重新获取'", desc: '倒计时结束后的提示语' },
  { prop: 'keepRunning', type: 'boolean', default: 'false', desc: '是否在退出页面后继续倒计时' },
  { prop: 'uniqueKey', type: 'string', default: '—', desc: 'keepRunning 时用于区分多个倒计时的标识' },
  { prop: 'onStart', type: '() => void', default: '—', desc: '倒计时开始时触发' },
  { prop: 'onChange', type: '(text: string) => void', default: '—', desc: '提示文字变化时触发' },
  { prop: 'onEnd', type: '() => void', default: '—', desc: '倒计时结束时触发' },
];

export default function CodeDemo() {
  const [tips, setTips] = useState('');
  const [tips1, setTips1] = useState('');
  const [tips2, setTips2] = useState('');
  const [disabled1, setDisabled1] = useState(false);
  const [disabled2, setDisabled2] = useState(false);
  const code = useRef<UPCodeRef>(null);
  const code1 = useRef<UPCodeRef>(null);
  const code2 = useRef<UPCodeRef>(null);
  const [events, setEvents] = useState<string[]>([]);

  // Upstream gates on `canGetCode`; locally the button's disabled state covers it.
  const request = (ref: React.RefObject<UPCodeRef | null>) => {
    toast.loading('正在获取验证码');
    setTimeout(() => {
      toast.hide();
      toast.default('验证码已发送');
      ref.current?.start();
    }, 2000);
  };

  return (
    <DemoPage>
      <Section direction="row" title="基础功能">
        <UPCode
          changeText="XS获取"
          onChange={setTips}
          onEnd={() => { setDisabled1(false); setEvents((prev) => [...prev, 'end']); }}
          onStart={() => { setDisabled1(true); setEvents((prev) => [...prev, 'start']); }}
          ref={code}
          seconds="20"
        />
        <UPButton
          disabled={disabled1}
          onClick={() => request(code)}
          size="small"
          text={tips}
          type="success"
        />
      </Section>

      <Section direction="row" title="保持倒计时(开始后，左上角返退出此页面再进入，会发现倒计时还在继续)">
        <UPCode
          changeText="倒计时XS"
          keepRunning
          onChange={setTips1}
          onEnd={() => setDisabled2(false)}
          onStart={() => setDisabled2(true)}
          ref={code1}
          uniqueKey="code-demo-keep-running"
        />
        <UPButton
          disabled={disabled2}
          onClick={() => request(code1)}
          size="small"
          text={tips1}
          type="primary"
        />
      </Section>

      <Section direction="row" title="文本样式">
        <UPCode
          keepRunning
          onChange={setTips2}
          ref={code2}
          startText="点我获取验证码"
          uniqueKey="code-demo-text-style"
        />
        <Text onPress={() => request(code2)} style={s.codeText}>{tips2}</Text>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  codeText: { color: '#3c9cff', fontSize: 15 },
});
