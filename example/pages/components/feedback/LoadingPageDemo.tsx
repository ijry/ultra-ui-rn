/**
 * UPLoadingPage 组件示例 — 加载页
 * 展示：不同加载模式、自定义文字
 */
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { UPLoadingPage } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'loading', type: 'boolean', default: 'true', desc: '是否显示加载' },
 { prop: 'loadingText', type: 'string | number', default: '—', desc: '加载文字' },
 { prop: 'loadingMode', type: 'spinner | circle | semicircle', default: 'spinner', desc: '加载动画类型' },
 { prop: 'bgColor', type: 'string', default: '—', desc: '背景色' },
 { prop: 'color', type: 'string', default: '—', desc: '文字颜色' },
 { prop: 'fontSize', type: 'number | string', default: '—', desc: '字体大小' },
 { prop: 'loadingColor', type: 'string', default: '—', desc: '加载动画颜色' },
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

export default function LoadingPageDemo() {
 const [show, setShow] = useState(true);

 return (
 <DemoPage>
 <Section title="切换显示">
 <Btn label={`${show ? '隐藏' : '显示'} Loading`} onPress={() => setShow((s) => !s)} />
 <View style={{ height: 10 }} />
 <UPLoadingPage loading={show} loadingText="加载中..." />
 </Section>

 <Section title="circle 模式">
 <UPLoadingPage loadingMode="circle" loadingText="加载中..." />
 </Section>

 <Section title="semicircle 模式">
 <UPLoadingPage loadingMode="semicircle" loadingText="请稍候..." />
 </Section>

 <Section title="自定义颜色">
 <UPLoadingPage loadingText="加载中" loadingColor="#07c160" color="#07c160" />
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
