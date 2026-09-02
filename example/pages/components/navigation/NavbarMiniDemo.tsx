/**
 * NavbarMini 迷你导航栏
 * 严格复刻 uview-plus pages/componentsD/navbarMini/navbarMini.nvue
 */
import React, { useState } from 'react';
import { UPGap, UPIcon, UPNavbarMini } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'safeAreaInsetTop', type: 'boolean', default: 'true', desc: '是否留出状态栏安全区' },
  { prop: 'placeholder', type: 'boolean', default: 'false', desc: 'fixed 时是否生成等高占位块' },
  { prop: 'fixed', type: 'boolean', default: 'true', desc: '是否固定在顶部' },
  { prop: 'autoBack', type: 'boolean', default: 'false', desc: '点击返回是否自动返回上一页' },
  { prop: 'homeUrl', type: 'string', default: '—', desc: '点击主页图标跳转的地址' },
  { prop: 'leftIcon', type: 'string', default: "'arrow-left'", desc: '左侧返回图标名' },
  { prop: 'bgColor', type: 'string', default: '—', desc: '背景颜色' },
  { prop: 'height', type: 'number | string', default: '32', desc: '导航栏高度' },
  { prop: 'iconSize', type: 'number | string', default: '—', desc: '图标大小' },
  { prop: 'iconColor', type: 'string', default: '—', desc: '图标颜色' },
  { prop: 'left', type: 'ReactNode', default: '—', desc: '自定义左侧内容（源 left 插槽）' },
  { prop: 'center', type: 'ReactNode', default: '—', desc: '自定义中间内容（源 center 插槽）' },
  { prop: 'onLeftClick', type: '(event) => void', default: '—', desc: '点击左侧返回时触发' },
  { prop: 'onHomeClick', type: '(event) => void', default: '—', desc: '点击主页图标时触发' },
];

export default function NavbarMiniDemo() {
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage>
      <PageItem title="基础功能">
        <UPNavbarMini
          fixed
          homeUrl="/pages/index/index"
          onLeftClick={() => setEvents((prev) => [...prev, 'leftClick'])}
          safeAreaInsetTop
        />
      </PageItem>

      <PageItem title="自定义插槽">
        <UPNavbarMini
          fixed={false}
          left={<UPIcon name="arrow-left" size={19} />}
          safeAreaInsetTop={false}
        />
      </PageItem>

      <UPGap height={50} />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
