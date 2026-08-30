/**
 * UPNotify 组件示例 — 通知
 * 展示：不同类型、自定义颜色、持续时间
 */
import React, { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { UPNotify, type UPNotifyRef } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'type', type: 'primary | success | warning | error', default: 'primary', desc: '通知类型' },
 { prop: 'message', type: 'string', default: '—', desc: '通知文字' },
 { prop: 'color', type: 'string', default: '—', desc: '文字颜色' },
 { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
 { prop: 'duration', type: 'number | string', default: '3000', desc: '持续时间(ms)' },
 { prop: 'fontSize', type: 'number | string', default: '—', desc: '字体大小' },
 { prop: 'top', type: 'number | string', default: '0', desc: '距顶部距离' },
];

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
 return (
 <Pressable
 onPress={onPress}
 style={{ backgroundColor: '#3c9cff', borderRadius: 6, marginBottom: 8, paddingVertical: 10, paddingHorizontal: 16 }}
 >
 <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>{label}</Text>
 </Pressable>
 );
}

export default function NotifyDemo() {
 const notifyRef = useRef<UPNotifyRef>(null);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 const show = (opts: any) => {
 notifyRef.current?.show(opts);
 log(`show: ${opts.message}`);
 };

 return (
 <DemoPage>
 <UPNotify ref={notifyRef} />

 <Section title="不同类型">
 <Btn label="Primary" onPress={() => show({ message: '这是一条 Primary 通知', type: 'primary' })} />
 <Btn label="Success" onPress={() => show({ message: '操作成功', type: 'success' })} />
 <Btn label="Warning" onPress={() => show({ message: '警告通知', type: 'warning' })} />
 <Btn label="Error" onPress={() => show({ message: '操作失败', type: 'error' })} />
 </Section>

 <Section title="自定义颜色">
 <Btn label="自定义背景" onPress={() => show({ message: '自定义颜色', bgColor: '#07c160', color: '#ffffff' })} />
 </Section>

 <Section title="自定义时长">
 <Btn label="5秒通知" onPress={() => show({ message: '持续5秒', duration: 5000 })} />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
