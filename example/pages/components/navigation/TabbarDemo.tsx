/**
 * UPTabbar 组件示例 — 标签栏
 * 展示：基础用法、受控值、自定义颜色、圆角、带徽标
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPTabbar, UPTabbarItem } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'string | number | null', default: 'null', desc: '受控值（v-model）' },
 { prop: 'activeColor', type: 'string', default: '#1989fa', desc: '激活颜色' },
 { prop: 'inactiveColor', type: 'string', default: '#7d7e80', desc: '未激活颜色' },
 { prop: 'border', type: 'boolean', default: 'false', desc: '显示顶部边框' },
 { prop: 'fixed', type: 'boolean', default: 'false', desc: '固定定位' },
 { prop: 'styleType', type: "string", default: 'default', desc: '样式类型：default/pill/glow/card/convex' },
 { prop: 'itemShape', type: 'string', default: 'default', desc: '项目形状：default/round/square' },
 { prop: 'onChange', type: '(name) => void', default: '—', desc: '切换回调' },
 { prop: 'onClick', type: '(name) => void', default: '—', desc: '点击回调' },
];

export default function TabbarDemo() {
 const [tab, setTab] = useState('home');
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPTabbar value={tab} onChange={(name) => { setTab(name as string); log(`onChange: ${name}`); }}>
 <UPTabbarItem name="home" icon="home" text="首页" />
 <UPTabbarItem name="cate" icon="list" text="分类" />
 <UPTabbarItem name="cart" icon="shopping-cart" text="购物车" />
 <UPTabbarItem name="mine" icon="account" text="我的" />
 </UPTabbar>
 <Value label="当前" value={tab} />
 </Section>

 <Section title="自定义颜色">
 <UPTabbar activeColor="#07c160" inactiveColor="#999999">
 <UPTabbarItem name="home" icon="home" text="首页" />
 <UPTabbarItem name="mine" icon="account" text="我的" />
 </UPTabbar>
 </Section>

 <Section title="圆角形状">
 <UPTabbar itemShape="round" activeColor="#ff9900">
 <UPTabbarItem name="a" icon="home" text="首页" />
 <UPTabbarItem name="b" icon="bell" text="消息" />
 <UPTabbarItem name="c" icon="account" text="我的" />
 </UPTabbar>
 </Section>

 <Section title="带徽标">
 <UPTabbar>
 <UPTabbarItem name="home" icon="home" text="首页" badge={1} />
 <UPTabbarItem name="cart" icon="shopping-cart" text="购物车" badge={99} />
 <UPTabbarItem name="mine" icon="account" text="我的" />
 </UPTabbar>
 </Section>

 <Section title="带边框">
 <UPTabbar border>
 <UPTabbarItem name="a" icon="home" text="首页" />
 <UPTabbarItem name="b" icon="account" text="我的" />
 </UPTabbar>
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
