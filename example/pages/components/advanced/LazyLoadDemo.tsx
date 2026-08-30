/**
 * UPLazyLoad 组件示例 — 懒加载
 * 展示：基础懒加载
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPLazyLoad } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'src', type: 'string', default: '—', desc: '图片地址' },
 { prop: 'image', type: 'string', default: '—', desc: '图片地址(源兼容)' },
 { prop: 'height', type: 'number | string', default: '—', desc: '高度' },
 { prop: 'width', type: 'number | string', default: '—', desc: '宽度' },
 { prop: 'mode', type: 'string', default: "'aspectFill'", desc: '图片模式' },
 { prop: 'placeholder', type: 'ReactNode', default: '—', desc: '占位内容' },
 { prop: 'once', type: 'boolean', default: 'false', desc: '是否只加载一次' },
 { prop: 'visible', type: 'boolean', default: '—', desc: '可见性(严格模式)' },
];

export default function LazyLoadDemo() {
 return (
 <DemoPage>
 <Section title="占位内容懒加载">
 <View style={{ height: 200 }}>
 <UPLazyLoad height={100} placeholder={<View style={ld.placeholder}><Text>加载中...</Text></View>} renderContent={() => (
 <View style={ld.loaded}>
 <Text style={ld.text}>✅ 内容已懒加载显示</Text>
 </View>
 )} />
 </View>
 </Section>

 <Section title="多段懒加载">
 {Array.from({ length: 3 }, (_, i) => (
 <UPLazyLoad key={i} height={80} once placeholder={<View style={ld.placeholder}><Text>段落 {i + 1} 加载中...</Text></View>} renderContent={() => (
 <View style={[ld.loaded, { backgroundColor: ['#e3f2fd', '#f3e5f5', '#e8f5e9'][i] }]}>
 <Text style={ld.text}>段落 {i + 1} 已加载</Text>
 </View>
 )} />
 ))}
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const ld = StyleSheet.create({
 placeholder: { height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8 },
 loaded: { height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: 8 },
 text: { fontSize: 14, color: '#333' },
});
