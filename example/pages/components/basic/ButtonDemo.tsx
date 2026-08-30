/**
 * UPButton 组件示例 — 按钮
 * 复刻 uview-plus u-button 页面结构
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPButton } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'type', type: "'info' | 'primary' | 'success' | 'warning' | 'error'", default: "'info'", desc: '按钮类型' },
 { prop: 'size', type: "'large' | 'normal' | 'small' | 'mini'", default: "'normal'", desc: '按钮大小' },
 { prop: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: '按钮形状' },
 { prop: 'plain', type: 'boolean', default: 'false', desc: '是否朴素按钮' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'loading', type: 'boolean', default: 'false', desc: '是否加载中' },
 { prop: 'text', type: 'string | number', default: '—', desc: '按钮文字' },
 { prop: 'color', type: 'string', default: '—', desc: '自定义颜色' },
 { prop: 'icon', type: 'string', default: '—', desc: '图标' },
 { prop: 'hairline', type: 'boolean', default: 'false', desc: '细边框' },
];

export default function ButtonDemo() {
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="按钮类型">
 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
 <UPButton type="info" text="info" />
 <UPButton type="primary" text="primary" />
 <UPButton type="success" text="success" />
 <UPButton type="warning" text="warning" />
 <UPButton type="error" text="error" />
 </View>
 </Section>

 <Section title="朴素按钮">
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <UPButton type="primary" plain text="primary" />
 <UPButton type="success" plain text="success" />
 <UPButton type="warning" plain text="warning" />
 </View>
 </Section>

 <Section title="按钮尺寸">
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
 <UPButton type="primary" size="large" text="large" />
 <UPButton type="primary" size="normal" text="normal" />
 <UPButton type="primary" size="small" text="small" />
 <UPButton type="primary" size="mini" text="mini" />
 </View>
 </Section>

 <Section title="禁用状态">
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <UPButton type="primary" disabled text="disabled" />
 <UPButton type="info" disabled plain text="disabled" />
 </View>
 </Section>

 <Section title="加载状态">
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <UPButton type="primary" loading loadingText="加载中" />
 <UPButton type="info" loading loadingText="loading" />
 </View>
 </Section>

 <Section title="自定义颜色">
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <UPButton color="#ff6600" text="自定义橙色" />
 <UPButton color="#67c23a" text="自定义绿色" plain />
 </View>
 </Section>

 <Section title="圆形/方形">
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <UPButton type="primary" shape="circle" text="圆形" />
 <UPButton type="primary" shape="square" text="方形" />
 </View>
 </Section>

 <Section title="细边框">
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <UPButton type="primary" hairline text="hairline" />
 <UPButton type="info" hairline plain text="hairline" />
 </View>
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
