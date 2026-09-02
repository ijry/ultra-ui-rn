/**
 * Tabbar 底部导航栏
 * 严格复刻 uview-plus pages/componentsB/tabbar/tabbar.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { UPGap, UPTabbar, UPTabbarItem, toast } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'value', type: 'string | number', default: '—', desc: '当前选中项的 name 或索引（v-model）' },
  { prop: 'safeAreaInsetBottom', type: 'boolean', default: 'true', desc: '是否留出底部安全区' },
  { prop: 'border', type: 'boolean', default: 'true', desc: '是否显示上边框' },
  { prop: 'borderColor', type: 'string', default: '#eeeeee', desc: '上边框颜色' },
  { prop: 'fixed', type: 'boolean', default: 'true', desc: '是否固定在底部' },
  { prop: 'placeholder', type: 'boolean', default: 'true', desc: 'fixed 时是否生成等高占位块' },
  { prop: 'activeColor', type: 'string', default: '#1989fa', desc: '选中项颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#7d7e80', desc: '未选中项颜色' },
  { prop: 'styleType', type: "'' | 'pill' | 'lift' | 'glow'", default: "''", desc: '整体风格' },
  { prop: 'animationType', type: "'' | 'scale' | 'lift'", default: "''", desc: '切换动画类型' },
  { prop: 'activeBackgroundColor', type: 'string', default: '—', desc: '选中项背景色' },
  { prop: 'textMode', type: "'always' | 'active'", default: "'always'", desc: '文字显示时机' },
  { prop: 'mode', type: "'' | 'midButton'", default: "''", desc: '标签模式（TabbarItem）' },
  { prop: 'midButtonBgColor', type: 'string', default: '—', desc: '中间按钮背景色（TabbarItem）' },
  { prop: 'activeIconNode', type: 'ReactNode', default: '—', desc: '自定义选中图标（源 active-icon 插槽）' },
  { prop: 'inactiveIconNode', type: 'ReactNode', default: '—', desc: '自定义未选中图标（源 inactive-icon 插槽）' },
  { prop: 'onChange', type: '(name) => void', default: '—', desc: '选中项改变时触发' },
];

const BELL_ACTIVE = 'https://uview-plus.jiangruyi.com/uview/common/bell-selected.png';
const BELL = 'https://uview-plus.jiangruyi.com/uview/common/bell.png';

/** 源用 /static/uview/tabbar/*.png 本地资源；example 无对应资源目录，改用图标名。 */
const STYLE_ITEMS = [
  { text: '首页', icon: 'home' },
  { text: '发现', icon: 'search' },
  { text: '消息', icon: 'chat' },
  { text: '我的', icon: 'account' },
];

export default function TabbarDemo() {
  const [value1, setValue1] = useState<string | number>(0);
  const [value2, setValue2] = useState<string | number>(1);
  const [value3, setValue3] = useState<string | number>('play-right');
  const [value4, setValue4] = useState<string | number>(0);
  const [value5, setValue5] = useState<string | number>(0);
  const [value6, setValue6] = useState<string | number>(0);
  const [value7, setValue7] = useState<string | number>(3);
  const [value8, setValue8] = useState<string | number>(0);
  const [value9, setValue9] = useState<string | number>(1);
  const [value10, setValue10] = useState<string | number>(1);
  const [value11, setValue11] = useState<string | number>(0);
  const [value12, setValue12] = useState<string | number>(2);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((prev) => [...prev, e]);

  const change5 = (name: string | number) => {
    if (name === 1) {
      toast.default('请您先登录');
      return;
    }
    setValue5(name);
  };

  return (
    <DemoPage>
      <PageItem title="基础功能">
        <UPTabbar
          fixed={false}
          onChange={(name) => { setValue1(name); log(`change1 ${String(name)}`); }}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value1}
        >
          <UPTabbarItem icon="home" onClick={() => log('click1')} text="首页" />
          <UPTabbarItem icon="photo" onClick={() => log('click1')} text="放映厅" />
          <UPTabbarItem icon="play-right" onClick={() => log('click1')} text="直播" />
          <UPTabbarItem icon="account" onClick={() => log('click1')} text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="显示徽标">
        <UPTabbar
          fixed={false}
          onChange={setValue2}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value2}
        >
          <UPTabbarItem dot icon="home" text="首页" />
          <UPTabbarItem badge="3" icon="photo" text="放映厅" />
          <UPTabbarItem icon="play-right" text="直播" />
          <UPTabbarItem icon="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="匹配标签的名称">
        <UPTabbar
          fixed={false}
          onChange={setValue3}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value3}
        >
          <UPTabbarItem icon="home" name="home" text="首页" />
          <UPTabbarItem icon="photo" name="photo" text="放映厅" />
          <UPTabbarItem icon="play-right" name="play-right" text="直播" />
          <UPTabbarItem icon="account" name="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="自定义图标/颜色">
        <UPTabbar
          activeColor="#d81e06"
          fixed={false}
          onChange={setValue4}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value4}
        >
          <UPTabbarItem
            activeIconNode={<Image source={{ uri: BELL_ACTIVE }} style={s.slotIcon} />}
            inactiveIconNode={<Image source={{ uri: BELL }} style={s.slotIcon} />}
            text="首页"
          />
          <UPTabbarItem icon="photo" text="放映厅" />
          <UPTabbarItem icon="play-right" text="直播" />
          <UPTabbarItem icon="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="拦截切换事件(点击第二个标签)">
        <UPTabbar
          fixed={false}
          onChange={change5}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value5}
        >
          <UPTabbarItem icon="home" text="首页" />
          <UPTabbarItem icon="photo" text="放映厅" />
          <UPTabbarItem icon="play-right" text="直播" />
          <UPTabbarItem icon="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="去除上边框">
        <UPTabbar
          border={false}
          fixed={false}
          onChange={setValue7}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value7}
        >
          <UPTabbarItem icon="home" text="首页" />
          <UPTabbarItem icon="photo" text="放映厅" />
          <UPTabbarItem icon="play-right" text="直播" />
          <UPTabbarItem icon="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="首页导航推荐：胶囊风格">
        <UPTabbar
          activeBackgroundColor="rgba(59, 130, 246, 0.10)"
          animationType="scale"
          fixed={false}
          onChange={setValue8}
          placeholder={false}
          safeAreaInsetBottom={false}
          styleType="pill"
          value={value8}
        >
          {STYLE_ITEMS.map((item) => (
            <UPTabbarItem icon={item.icon} key={item.text} text={item.text} />
          ))}
        </UPTabbar>
      </PageItem>

      <PageItem title="首页导航推荐：上浮风格">
        <UPTabbar
          animationType="lift"
          fixed={false}
          onChange={setValue9}
          placeholder={false}
          safeAreaInsetBottom={false}
          styleType="lift"
          textMode="active"
          value={value9}
        >
          {STYLE_ITEMS.map((item) => (
            <UPTabbarItem icon={item.icon} key={item.text} text={item.text} />
          ))}
        </UPTabbar>
      </PageItem>

      <PageItem title="中间按钮自定义背景色">
        <UPTabbar
          fixed={false}
          onChange={setValue11}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value11}
        >
          <UPTabbarItem icon="home" text="首页" />
          <UPTabbarItem icon="search" text="发现" />
          <UPTabbarItem
            icon="plus"
            midButtonBgColor="#E8FFF7"
            midButtonIconColor="#10B981"
            midButtonOffsetY={-12}
            mode="midButton"
            text="发布"
          />
          <UPTabbarItem icon="chat" text="消息" />
          <UPTabbarItem icon="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="中间按钮自定义图标">
        <UPTabbar
          fixed={false}
          onChange={setValue12}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value12}
        >
          <UPTabbarItem icon="home" text="首页" />
          <UPTabbarItem icon="search" text="发现" />
          <UPTabbarItem
            icon="camera-fill"
            midButtonBgColor="#EEF4FF"
            midButtonIconColor="#3B82F6"
            midButtonIconSize={30}
            midButtonOffsetY={-12}
            mode="midButton"
            text="拍摄"
          />
          <UPTabbarItem icon="chat" text="消息" />
          <UPTabbarItem icon="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <PageItem title="首页导航推荐：发光风格">
        <UPTabbar
          activeBackgroundColor="rgba(125, 211, 252, 0.12)"
          animationType="scale"
          fixed={false}
          onChange={setValue10}
          placeholder={false}
          safeAreaInsetBottom={false}
          styleType="glow"
          value={value10}
        >
          {STYLE_ITEMS.map((item) => (
            <UPTabbarItem icon={item.icon} key={item.text} text={item.text} />
          ))}
        </UPTabbar>
      </PageItem>

      <PageItem title="固定在底部及中间按钮">
        <UPGap height={150} />
        {/* 源此节 fixed + placeholder + safeAreaInsetBottom 全开；示例页内联展示，保持非固定避免遮挡其他分节。 */}
        <UPTabbar
          borderColor="red"
          fixed={false}
          onChange={setValue6}
          placeholder={false}
          safeAreaInsetBottom={false}
          value={value6}
        >
          <UPTabbarItem icon="home" onClick={() => log('goNext → tabbar2')} text="首页" />
          <UPTabbarItem icon="photo" text="放映厅" />
          <UPTabbarItem
            icon="plus"
            mode="midButton"
            onClick={() => toast.default('点击了中间按钮')}
            text=""
          />
          <UPTabbarItem icon="play-right" text="直播" />
          <UPTabbarItem icon="account" text="我的" />
        </UPTabbar>
      </PageItem>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  slotIcon: { height: 22, width: 22 },
});
