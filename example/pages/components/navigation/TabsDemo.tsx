/**
 * UPTabs 组件示例 — 标签页
 * 展示：基础标签、胶囊模式、卡片模式、带图标、带徽标、可滚动
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPTabs } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'list', type: 'UPTabItem[]', default: '[]', desc: '标签数据数组' },
 { prop: 'current', type: 'number | string', default: '0', desc: '当前激活索引（v-model）' },
 { prop: 'keyName', type: 'string', default: 'name', desc: '标签文字字段名' },
 { prop: 'lineWidth', type: 'number | string', default: '20', desc: '指示线宽度' },
 { prop: 'lineHeight', type: 'number | string', default: '3', desc: '指示线高度' },
 { prop: 'lineColor', type: 'string', default: '主题色', desc: '指示线颜色' },
 { prop: 'shapeMode', type: "'' | 'capsule' | 'card' | 'pill-arrow' | 'tag'", default: "''", desc: '形状模式' },
 { prop: 'scrollable', type: 'boolean', default: 'false', desc: '可滚动' },
 { prop: 'onChange', type: '(item, index) => void', default: '—', desc: '切换回调' },
 { prop: 'onClick', type: '(item, index) => void', default: '—', desc: '点击回调' },
];

export default function TabsDemo() {
 const [current, setCurrent] = useState(0);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 const tabs = [{ name: '推荐' }, { name: '热门' }, { name: '最新' }];

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPTabs
 list={tabs}
 current={current}
 onChange={(item, i) => { setCurrent(i); log(`onChange: ${item.name} (${i})`); }}
 />
 <View style={{ padding: 12 }}>
 <Text style={{ color: '#909399' }}>当前标签：{tabs[current]?.name}</Text>
 </View>
 </Section>

 <Section title="胶囊模式">
 <UPTabs list={tabs} shapeMode="capsule" current={1} />
 </Section>

 <Section title="卡片模式">
 <UPTabs list={tabs} shapeMode="card" current={0} />
 </Section>

 <Section title="标签模式">
 <UPTabs list={tabs} shapeMode="tag" current={2} />
 </Section>

 <Section title="带图标 + 徽标">
 <UPTabs
 list={[
 { name: '首页', icon: 'home' },
 { name: '消息', icon: 'bell', badge: { value: 3 } },
 { name: '我的', icon: 'account' },
 ]}
 current={0}
 />
 </Section>

 <Section title="自定义指示线">
 <UPTabs list={tabs} lineWidth={30} lineHeight={4} lineColor="#07c160" />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
