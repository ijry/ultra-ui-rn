/**
 * UPNavbarMini 组件示例 — 迷你导航栏
 * 展示：基础用法、自定义颜色、自定义渲染
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPNavbarMini } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'fixed', type: 'boolean', default: 'false', desc: '固定定位' },
  { prop: 'autoBack', type: 'boolean', default: 'false', desc: '自动返回' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
  { prop: 'height', type: 'number | string', default: '44', desc: '高度' },
  { prop: 'iconSize', type: 'number | string', default: '20', desc: '图标大小' },
  { prop: 'iconColor', type: 'string', default: '—', desc: '图标颜色' },
  { prop: 'renderLeft', type: '() => ReactNode', default: '—', desc: '自定义左侧渲染' },
  { prop: 'renderCenter', type: '() => ReactNode', default: '—', desc: '自定义中间渲染' },
];

export default function NavbarMiniDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="NavbarMini 迷你导航栏" onBack={onBack}>
      <Section title="基础用法">
        <UPNavbarMini />
      </Section>

      <Section title="自动返回">
        <UPNavbarMini autoBack />
      </Section>

      <Section title="自定义颜色">
        <UPNavbarMini bgColor="#1989fa" iconColor="#ffffff" />
      </Section>

      <Section title="自定义高度">
        <UPNavbarMini height={56} />
      </Section>

      <Section title="自定义渲染">
        <UPNavbarMini
          renderLeft={() => (
            <Text style={{ color: '#3c9cff', fontSize: 14 }}>🏠 首页</Text>
          )}
          renderCenter={() => (
            <Text style={{ color: '#303133', fontSize: 16, fontWeight: '600' }}>迷你导航栏</Text>
          )}
        />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
