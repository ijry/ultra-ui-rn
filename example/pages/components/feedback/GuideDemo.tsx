/**
 * UPGuide 组件示例 — 新手引导
 * 复刻 uview-plus u-guide 页面结构
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPGuide } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PAGES = [
 { bgColor: '#3c9cff', text: '第一步：点击此处开始', icon: '📱' },
 { bgColor: '#67c23a', text: '第二步：浏览内容', icon: '📖' },
 { bgColor: '#ff6600', text: '第三步：完成设置', icon: '✅' },
];

const PROPS = [
 { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示' },
 { prop: 'list', type: 'GuidePage[]', default: '[]', desc: '引导页数据' },
 { prop: 'indicator', type: 'boolean', default: 'true', desc: '显示指示器' },
 { prop: 'showSkip', type: 'boolean', default: 'true', desc: '显示跳过按钮' },
 { prop: 'nextText', type: 'string', default: "'下一步'", desc: '下一步文字' },
 { prop: 'finishText', type: 'string', default: "'完成'", desc: '完成文字' },
 { prop: 'skipText', type: 'string', default: "'跳过'", desc: '跳过文字' },
 { prop: 'once', type: 'boolean', default: 'false', desc: '仅显示一次' },
 { prop: 'renderPage', type: '(payload) => ReactNode', default: '—', desc: '自定义页面渲染' },
];

export default function GuideDemo() {
 const [show, setShow] = useState(false);
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <View style={{ padding: 12 }}>
 <View style={gd.box} onTouchEnd={() => setShow(true)}>
 <Text>点击触发引导</Text>
 </View>
 </View>
 <UPGuide
 show={show}
 list={PAGES}
 indicator
 showSkip
 nextText="下一步"
 finishText="完成"
 skipText="跳过"
 onSkip={() => { setShow(false); setEvents((e) => [...e, 'skip']); }}
 onFinish={() => { setShow(false); setEvents((e) => [...e, 'finish']); }}
 />
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const gd = StyleSheet.create({
 box: { backgroundColor: '#e3f2fd', height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
});
