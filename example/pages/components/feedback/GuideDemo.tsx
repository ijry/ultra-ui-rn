/**
 * Guide 引导页
 * 严格复刻 uview-plus pages/componentsC/guide/guide.vue
 */
import React, { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { UPButton, UPGuide, toast, type UPGuideRef } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示引导（v-model）' },
  { prop: 'list', type: 'GuidePage[]', default: '[]', desc: '引导页数据（image / title / desc）' },
  { prop: 'storageKey', type: 'string', default: '—', desc: '本地存储键名，用于只显示一次' },
  { prop: 'once', type: 'boolean', default: 'true', desc: '是否只显示一次' },
  { prop: 'indicator', type: 'boolean', default: 'true', desc: '是否显示页码指示器' },
  { prop: 'showSkip', type: 'boolean', default: 'true', desc: '是否显示跳过按钮' },
  { prop: 'skipText', type: 'string', default: "'跳过'", desc: '跳过按钮文字' },
  { prop: 'nextText', type: 'string', default: "'下一步'", desc: '下一步按钮文字' },
  { prop: 'finishText', type: 'string', default: "'立即体验'", desc: '最后一页按钮文字' },
  { prop: 'renderPage', type: '(payload) => ReactNode', default: '—', desc: '自定义单页渲染' },
  { prop: 'onChange', type: '(payload) => void', default: '—', desc: '切换页面时触发' },
  { prop: 'onSkip', type: '() => void', default: '—', desc: '点击跳过时触发' },
  { prop: 'onFinish', type: '() => void', default: '—', desc: '完成引导时触发' },
];

/** 源用 /static/uview/common/*.png|jpg 本地资源，example 无对应目录，改用同源远程图。 */
const list = [
  {
    image: 'https://uview-plus.jiangruyi.com/uview/common/logo.png',
    title: '欢迎使用 uview-plus',
    desc: '一套跨端可复用的高质量组件库。',
  },
  {
    image: 'https://uview-plus.jiangruyi.com/uview/common/gray-logo.png',
    title: '引导页支持多页滑动',
    desc: '可配置跳过、下一步和立即体验。',
  },
  {
    image: 'https://uview-plus.jiangruyi.com/uview/common/logo.jpg',
    title: '只显示一次',
    desc: '默认内置本地存储记忆能力。',
  },
];

export default function GuideDemo() {
  const [show, setShow] = useState(true);
  const guide = useRef<UPGuideRef>(null);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((prev) => [...prev, e]);

  const openGuide = () => {
    setShow(true);
    guide.current?.open();
  };

  const resetGuide = () => {
    void guide.current?.reset();
    toast.default('已重置');
  };

  return (
    <DemoPage>
      <Section direction="row" title="基础使用（首次进入显示）">
        <UPButton customStyle={s.spaced} onClick={openGuide} text="重新打开引导" type="primary" />
        <UPButton onClick={resetGuide} text="重置首次标记" />
      </Section>

      <UPGuide
        list={list}
        onChange={(payload) => log(`guide change ${JSON.stringify(payload)}`)}
        onFinish={() => { setShow(false); log('guide finish'); }}
        onSkip={() => { setShow(false); log('guide skip'); }}
        onUpdateShow={setShow}
        ref={guide}
        show={show}
        storageKey="demo-up-guide-once"
      />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  spaced: { marginRight: 8 },
});
