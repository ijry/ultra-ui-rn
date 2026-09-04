/**
 * NoticeBar 滚动通知
 * 严格复刻 uview-plus pages/componentsB/noticeBar/noticeBar.nvue
 */
import React, { useState } from 'react';
import { UPNoticeBar } from 'ultra-ui-rn';
import { DemoPage, EventLog, PropsTable, Section } from '../_shared';

const text1 = 'uview-plus众多组件覆盖开发过程的各个需求，组件功能丰富，多端兼容。让您快速集成，开箱即用';
const text2 = 'uview-plus众多的贴心小工具，是您开发过程中召之即来的利器，让您飞镖在手，百步穿杨';
const text3 = 'uview-plus收集众多的常用页面和布局，减少开发者的重复工作，让您专注逻辑，事半功倍';
const text4 = ['寒雨连江夜入吴', '平明送客楚山孤', '洛阳亲友如相问', '一片冰心在玉壶'];
const text5 = '涵盖uniapp各个方面，给开发者方向指导和设计理念，让您茅塞顿开，一马平川';

const PROPS = [
  { prop: 'text', type: 'string | string[]', default: '[]', desc: '显示的文字内容' },
  { prop: 'direction', type: "'row' | 'column'", default: "'row'", desc: '滚动方向' },
  { prop: 'step', type: 'boolean', default: 'false', desc: '横向滚动时是否步进形式滚动' },
  { prop: 'icon', type: 'string', default: "'volume'", desc: '左侧图标名称' },
  { prop: 'mode', type: "'' | 'link' | 'closable'", default: "''", desc: '通知栏模式' },
  { prop: 'color', type: 'string', default: "'#f9ae3d'", desc: '文字和图标颜色' },
  { prop: 'bgColor', type: 'string', default: "'#fdf6ec'", desc: '背景颜色' },
  { prop: 'speed', type: 'number | string', default: '80', desc: '横向滚动速度，每秒移动多少像素' },
  { prop: 'fontSize', type: 'number | string', default: '14', desc: '字体大小' },
  { prop: 'duration', type: 'number | string', default: '2000', desc: '纵向滚动时，单个消息的停留毫秒数' },
  { prop: 'disableTouch', type: 'boolean', default: 'true', desc: '是否禁止手动拖动' },
  { prop: 'url', type: 'string', default: "''", desc: '点击后跳转的路径（RN 中导航由应用负责，已废弃）' },
  { prop: 'linkType', type: 'string', default: "'navigateTo'", desc: '跳转方式（RN 中导航由应用负责，已废弃）' },
  { prop: 'justifyContent', type: 'ViewStyle["justifyContent"]', default: "'flex-start'", desc: '文字对齐方式' },
  { prop: 'onClick', type: '(index?: number) => void', default: '—', desc: '点击通知栏时触发' },
  { prop: 'onClose', type: '() => void', default: '—', desc: 'closable 模式下点击关闭按钮时触发' },
];

export default function NoticeBarDemo() {
  const [events, setEvents] = useState<string[]>([]);
  // 源 demo 的 click 事件只做 console.log，这里改为可见的事件日志。
  const click = (index?: number) => {
    setEvents((list) => [...list, `click: ${index ?? ''}`]);
  };

  return (
    <DemoPage>
      <Section title="基础功能">
        <UPNoticeBar fontSize="30px" text={text1} />
      </Section>

      <Section title="可关闭">
        <UPNoticeBar mode="closable" text={text5} />
      </Section>

      <Section title="自定义横向滚动速度">
        <UPNoticeBar mode="closable" speed="250" text={text2} />
      </Section>

      <Section title="可跳转(点击右箭头)">
        {/* `url` 在 RN 中已废弃：导航由宿主应用负责，组件只渲染右箭头。 */}
        <UPNoticeBar mode="link" text={text3} url="/pages/componentsB/tag/tag" />
      </Section>

      <Section title="横向步进滚动">
        {/* 源组件的 step 为逐条横向步进动画，本地实现只做无动画的整条切换。 */}
        <UPNoticeBar onClick={click} step text={text4} />
      </Section>

      <Section title="纵向滚动">
        <UPNoticeBar direction="column" onClick={click} text={text4} />
      </Section>

      <Section title="纵向滚动(文字居中)">
        {/* 本地 justifyContent 作用在纵向主轴上，无法让文字水平居中。 */}
        <UPNoticeBar direction="column" justifyContent="center" onClick={click} text={text4} />
      </Section>

      <Section title="自定义样式">
        <UPNoticeBar bgColor="#f56c6c" color="#ffffff" text={text1} />
      </Section>

      <EventLog events={events} />

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
