/**
 * UPActionSheet 组件示例 — 操作面板
 * 展示：基础用法、带标题描述、自定义选项颜色、禁用选项
 */
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { UPActionSheet } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
 { prop: 'actions', type: 'UPActionSheetAction[]', default: '[]', desc: '操作选项数组' },
 { prop: 'title', type: 'string', default: '—', desc: '标题' },
 { prop: 'description', type: 'string', default: '—', desc: '描述' },
 { prop: 'cancelText', type: 'string', default: '取消', desc: '取消按钮文字' },
 { prop: 'closeOnClickAction', type: 'boolean', default: 'true', desc: '点击选项后关闭' },
 { prop: 'closeOnClickOverlay', type: 'boolean', default: 'true', desc: '点击遮罩关闭' },
 { prop: 'round', type: 'boolean | number', default: 'true', desc: '圆角' },
 { prop: 'onSelect', type: '(action) => void', default: '—', desc: '选项点击回调' },
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

export default function ActionSheetDemo() {
 const [show1, setShow1] = useState(false);
 const [show2, setShow2] = useState(false);
 const [show3, setShow3] = useState(false);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <Btn label="打开操作面板" onPress={() => setShow1(true)} />
 <UPActionSheet
 show={show1}
 actions={[
 { name: '拍照' },
 { name: '从相册选择' },
 { name: '保存图片' },
 ]}
 onSelect={(a) => { log(`select: ${a.name}`); setShow1(false); }}
 onClose={() => { log('close'); setShow1(false); }}
 />
 </Section>

 <Section title="带标题和描述">
 <Btn label="打开（带标题）" onPress={() => setShow2(true)} />
 <UPActionSheet
 show={show2}
 title="请选择操作"
 description="选择一种方式上传头像"
 actions={[
 { name: '拍照', nameKey: 'name' },
 { name: '从相册选择' },
 ]}
 onSelect={(a) => { log(`select: ${a.name}`); setShow2(false); }}
 onClose={() => setShow2(false)}
 />
 </Section>

 <Section title="禁用选项 + 自定义颜色">
 <Btn label="打开（禁用+颜色）" onPress={() => setShow3(true)} />
 <UPActionSheet
 show={show3}
 title="自定义样式"
 actions={[
 { name: '正常选项' },
 { name: '红色选项', color: '#f56c6c' },
 { name: '禁用选项', disabled: true },
 { name: '绿色选项', color: '#07c160' },
 ]}
 onSelect={(a) => { log(`select: ${a.name}`); setShow3(false); }}
 onClose={() => setShow3(false)}
 />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
