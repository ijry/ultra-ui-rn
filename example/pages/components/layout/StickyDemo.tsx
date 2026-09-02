/**
 * Sticky 吸顶
 * 严格复刻 uview-plus pages/componentsA/sticky/sticky.nvue
 */
import React from 'react';
import { UPButton, UPDivider, UPGap, UPSticky, UPText } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'offsetTop', type: 'number | string', default: '0', desc: '吸顶时与顶部的距离' },
  { prop: 'customNavHeight', type: 'number | string', default: '—', desc: '自定义导航栏高度' },
  { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用吸顶' },
  { prop: 'bgColor', type: 'string', default: '#ffffff', desc: '吸顶区域背景色' },
  { prop: 'zIndex', type: 'number | string', default: '—', desc: '吸顶时的层级' },
  { prop: 'index', type: 'string | number', default: '—', desc: '标识符，回调时回传' },
  { prop: 'onFixed', type: '(index) => void', default: '—', desc: '吸顶时触发' },
  { prop: 'onUnfixed', type: '(index) => void', default: '—', desc: '取消吸顶时触发' },
];

export default function StickyDemo() {
  return (
    <DemoPage>
      <Section contentStyle={s.flush} title="基础使用">
        <UPText text="滚动页面,即可看到下方的按钮会吸顶。" type="content" />
      </Section>

      <UPSticky>
        <UPButton text="吸顶按钮" type="success" />
      </UPSticky>

      <UPGap height={1500} />

      <UPDivider text="已到底部" />

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = { flush: { backgroundColor: 'transparent', padding: 0 } } as const;
