/**
 * UPSwiper 组件示例 — 轮播
 * 展示：基础轮播、自动播放、自定义指示器、竖向、循环
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPSwiper } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const SLIDES = [
 { image: 'https://picsum.photos/400/200?random=1' },
 { image: 'https://picsum.photos/400/200?random=2' },
 { image: 'https://picsum.photos/400/200?random=3' },
 { image: 'https://picsum.photos/400/200?random=4' },
];

const PROPS = [
 { prop: 'list', type: 'UPSwiperItem[]', default: '[]', desc: '轮播数据' },
 { prop: 'autoplay', type: 'boolean', default: 'false', desc: '是否自动轮播' },
 { prop: 'interval', type: 'number | string', default: '3000', desc: '轮播间隔(ms)' },
 { prop: 'circular', type: 'boolean', default: 'false', desc: '是否循环播放' },
 { prop: 'indicator', type: 'boolean', default: 'true', desc: '是否显示指示器' },
 { prop: 'indicatorMode', type: "'line' | 'dot'", default: "'dot'", desc: '指示器样式' },
 { prop: 'vertical', type: 'boolean', default: 'false', desc: '是否竖向轮播' },
 { prop: 'current', type: 'number | string', default: '0', desc: '当前激活索引' },
];

export default function SwiperDemo() {
 const [current, setCurrent] = useState(0);
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="基础轮播">
 <UPSwiper
 list={SLIDES}
 indicator
 onChange={(event) => setEvents((e) => [...e, `change: ${event.current}`])}
 />
 </Section>

 <Section title="自动播放 + 循环">
 <UPSwiper list={SLIDES} autoplay circular interval={2000} />
 </Section>

 <Section title="线条指示器">
 <UPSwiper list={SLIDES} indicatorMode="line" autoplay circular />
 </Section>

 <Section title="竖向轮播">
 <UPSwiper list={SLIDES} vertical autoplay circular interval={1500} />
 </Section>

 <Section title="受控轮播">
 <UPSwiper
 list={SLIDES}
 current={current}
 onChange={(event) => {
 setCurrent(event.current);
 setEvents((e) => [...e, `change: ${event.current}`]);
 }}
 />
 <Row>
 {SLIDES.map((_, i) => (
 <View key={i} style={{ padding: 8, margin: 2, backgroundColor: i === current ? '#3c9cff' : '#e0e0e0', borderRadius: 4 }}>
 <Text style={{ color: i === current ? '#fff' : '#333', fontSize: 12 }}>{i + 1}</Text>
 </View>
 ))}
 </Row>
 </Section>

 <Section title="自定义指示器颜色">
 <UPSwiper
 list={SLIDES}
 indicatorActiveColor="#ff6600"
 indicatorInactiveColor="#ccc"
 indicatorMode="dot"
 />
 </Section>

 <Value label="当前索引" value={current} />
 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
