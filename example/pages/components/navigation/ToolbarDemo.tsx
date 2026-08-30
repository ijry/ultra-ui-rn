/**
 * UPToolbar 组件示例 — 工具栏
 * 展示：基础用法、自定义文字颜色、右侧自定义 slot
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPToolbar } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示' },
 { prop: 'title', type: 'string', default: '—', desc: '标题文字' },
 { prop: 'cancelText', type: 'string', default: '取消', desc: '取消按钮文字' },
 { prop: 'confirmText', type: 'string', default: '确认', desc: '确认按钮文字' },
 { prop: 'cancelColor', type: 'string', default: '—', desc: '取消按钮颜色' },
 { prop: 'confirmColor', type: 'string', default: '主题色', desc: '确认按钮颜色' },
 { prop: 'rightSlot', type: 'boolean', default: 'false', desc: '使用右侧自定义 slot' },
 { prop: 'right', type: 'ReactNode', default: '—', desc: '右侧自定义内容' },
 { prop: 'onCancel', type: '() => void', default: '—', desc: '取消回调' },
 { prop: 'onConfirm', type: '() => void', default: '—', desc: '确认回调' },
];

export default function ToolbarDemo() {
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPToolbar
 show
 title="请选择"
 onCancel={() => log('cancel')}
 onConfirm={() => log('confirm')}
 />
 </Section>

 <Section title="自定义文字颜色">
 <UPToolbar
 show
 title="自定义颜色"
 cancelColor="#909399"
 confirmColor="#07c160"
 onCancel={() => log('cancel')}
 onConfirm={() => log('confirm')}
 />
 </Section>

 <Section title="无标题">
 <UPToolbar
 show
 onCancel={() => log('cancel')}
 onConfirm={() => log('confirm')}
 />
 </Section>

 <Section title="右侧 slot">
 <UPToolbar
 show
 title="自定义右侧"
 rightSlot
 right={<Text style={{ color: '#3c9cff', paddingHorizontal: 15 }}>完成</Text>}
 onCancel={() => log('cancel')}
 />
 </Section>

 <Section title="隐藏状态">
 <UPToolbar show={false} />
 <Text style={{ color: '#909399', textAlign: 'center', padding: 12 }}>show=false 时 Toolbar 不渲染</Text>
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
