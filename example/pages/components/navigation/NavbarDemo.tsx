/**
 * UPNavbar 组件示例 — 导航栏
 * 展示：基础用法、自定义标题、左右按钮、固定模式、自定义颜色
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPNavbar } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'title', type: 'string | number', default: '—', desc: '标题文字' },
 { prop: 'leftText', type: 'string', default: '—', desc: '左侧文字' },
 { prop: 'leftIcon', type: 'string', default: '—', desc: '左侧图标名' },
 { prop: 'rightText', type: 'string', default: '—', desc: '右侧文字' },
 { prop: 'rightIcon', type: 'string', default: '—', desc: '右侧图标名' },
 { prop: 'autoBack', type: 'boolean', default: 'false', desc: '自动返回（左侧箭头）' },
 { prop: 'fixed', type: 'boolean', default: 'false', desc: '固定定位' },
 { prop: 'border', type: 'boolean', default: 'false', desc: '显示底部边框' },
 { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
 { prop: 'height', type: 'number | string', default: '44', desc: '导航栏高度' },
 { prop: 'onLeftClick', type: '(event) => void', default: '—', desc: '左侧点击回调' },
 { prop: 'onRightClick', type: '(event) => void', default: '—', desc: '右侧点击回调' },
];

export default function NavbarDemo() {
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPNavbar title="页面标题" />
 </Section>

 <Section title="左右文字">
 <UPNavbar
 title="中间标题"
 leftText="取消"
 rightText="保存"
 onLeftClick={() => log('left click')}
 onRightClick={() => log('right click')}
 />
 </Section>

 <Section title="底部边框">
 <UPNavbar title="带边框" border />
 </Section>

 <Section title="自定义颜色">
 <UPNavbar
 title="自定义"
 bgColor="#1989fa"
 titleColor="#ffffff"
 leftIconColor="#ffffff"
 />
 </Section>

 <Section title="自定义高度">
 <UPNavbar title="高导航栏" height={56} />
 </Section>

 <Section title="renderLeft / renderRight">
 <UPNavbar
 title="自定义渲染"
 renderLeft={() => (
 <Text style={{ color: '#3c9cff', fontSize: 14 }}>🏠 首页</Text>
 )}
 renderRight={() => (
 <Text style={{ color: '#3c9cff', fontSize: 14 }}>⚙️</Text>
 )}
 />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
