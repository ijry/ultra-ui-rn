/**
 * Navbar 自定义导航栏
 * 严格复刻 uview-plus pages/componentsC/navbar/navbar.nvue
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPButton, UPGap, UPIcon, UPLine, UPNavbar, toast } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'title', type: 'string | number', default: '—', desc: '导航栏标题' },
  { prop: 'safeAreaInsetTop', type: 'boolean', default: 'true', desc: '是否留出状态栏安全区' },
  { prop: 'placeholder', type: 'boolean', default: 'false', desc: 'fixed 时是否生成等高占位块' },
  { prop: 'fixed', type: 'boolean', default: 'true', desc: '是否固定在顶部' },
  { prop: 'border', type: 'boolean', default: 'false', desc: '是否显示下边框' },
  { prop: 'leftIcon', type: 'string', default: "'arrow-left'", desc: '左侧图标名' },
  { prop: 'leftText', type: 'string', default: '—', desc: '左侧文字' },
  { prop: 'rightText', type: 'string', default: '—', desc: '右侧文字' },
  { prop: 'rightIcon', type: 'string', default: '—', desc: '右侧图标名' },
  { prop: 'autoBack', type: 'boolean', default: 'false', desc: '点击左侧是否自动返回上一页' },
  { prop: 'left', type: 'ReactNode', default: '—', desc: '自定义左侧内容（源 left 插槽）' },
  { prop: 'center', type: 'ReactNode', default: '—', desc: '自定义中间内容（源 center 插槽）' },
  { prop: 'right', type: 'ReactNode', default: '—', desc: '自定义右侧内容（源 right 插槽）' },
  { prop: 'onLeftClick', type: '(event) => void', default: '—', desc: '点击左侧区域时触发' },
  { prop: 'onRightClick', type: '(event) => void', default: '—', desc: '点击右侧区域时触发' },
];

export default function NavbarDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((prev) => [...prev, e]);

  return (
    <DemoPage>
      <PageItem title="iOS 大标题模式">
        {/* 源页跳转到 navbarIos 独立页面；RN 示例内无对应路由，提示代替。 */}
        <UPButton
          onClick={() => toast.default('源页跳转 navbarIos 独立页面')}
          text="查看 iOS 模式示例"
          type="primary"
        />
      </PageItem>

      <PageItem title="基础功能">
        <UPNavbar
          fixed={false}
          onLeftClick={() => log('leftClick')}
          onRightClick={() => log('rightClick')}
          safeAreaInsetTop={false}
          title="个人中心"
        />
      </PageItem>

      <PageItem title="自定义文本">
        <UPNavbar
          fixed={false}
          leftText="返回"
          rightIcon="map"
          safeAreaInsetTop={false}
          title="个人中心"
        />
      </PageItem>

      <PageItem title="自定义插槽">
        <UPNavbar
          fixed={false}
          left={
            <View style={s.navSlot}>
              <UPIcon name="arrow-left" size={19} />
              {/* 源 demo 写的是 direction="column"，但 u-line 只认 'row' | 'col'，
                  落到 else 分支才碰巧竖向；这里用文档规定的 'col'，渲染结果一致。 */}
              <UPLine direction="col" hairline={false} length="16" margin="0 8px" />
              <UPIcon name="home" size={20} />
            </View>
          }
          leftText="返回"
          safeAreaInsetTop={false}
          title="个人中心"
        />
      </PageItem>

      <UPGap height={50} />

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  navSlot: {
    alignItems: 'center',
    borderColor: '#dadbde',
    borderRadius: 100,
    borderWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
});
