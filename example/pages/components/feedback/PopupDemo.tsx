/**
 * UPPopup 组件示例 — 弹出层
 * 展示：底部/顶部/左侧/右侧/居中弹出、圆角、关闭按钮、遮罩
 */
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { UPPopup } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
 { prop: 'mode', type: 'top | bottom | left | right | center', default: 'bottom', desc: '弹出方向' },
 { prop: 'overlay', type: 'boolean', default: 'true', desc: '显示遮罩' },
 { prop: 'closeable', type: 'boolean', default: 'false', desc: '显示关闭按钮' },
 { prop: 'closeOnClickOverlay', type: 'boolean', default: 'true', desc: '点击遮罩关闭' },
 { prop: 'round', type: 'boolean | number', default: 'false', desc: '圆角' },
 { prop: 'zoom', type: 'boolean', default: 'false', desc: '缩放动画' },
 { prop: 'bgColor', type: 'string', default: '#ffffff', desc: '背景色' },
 { prop: 'onChangeShow', type: '(show: boolean) => void', default: '—', desc: '显示变化回调' },
 { prop: 'onClose', type: '() => void', default: '—', desc: '关闭回调' },
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

function PopupContent({ title }: { title: string }) {
 return (
 <View style={{ alignItems: 'center', padding: 24 }}>
 <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{title}</Text>
 <Text style={{ color: '#909399', textAlign: 'center' }}>这里是弹出层内容区域</Text>
 </View>
 );
}

export default function PopupDemo() {
 const [mode, setMode] = useState<'bottom' | 'top' | 'left' | 'right' | 'center'>('bottom');
 const [show, setShow] = useState(false);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 const open = (m: typeof mode) => { setMode(m); setShow(true); log(`open: ${m}`); };

 return (
 <DemoPage>
 <Section title="弹出方向">
 <Btn label="底部弹出" onPress={() => open('bottom')} />
 <Btn label="顶部弹出" onPress={() => open('top')} />
 <Btn label="左侧弹出" onPress={() => open('left')} />
 <Btn label="右侧弹出" onPress={() => open('right')} />
 <Btn label="居中弹出" onPress={() => open('center')} />
 </Section>

 <Section title="圆角 + 关闭按钮">
 <Btn label="底部圆角 + 关闭" onPress={() => { setMode('bottom'); setShow(true); }} />
 </Section>

 <UPPopup
 show={show}
 mode={mode}
 round={mode === 'bottom' || mode === 'center'}
 closeable
 closeOnClickOverlay
 onChangeShow={(s) => { setShow(s); log(`onChangeShow: ${s}`); }}
 onClose={() => log('onClose')}
 >
 <PopupContent title={`${mode} 弹出`} />
 </UPPopup>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
