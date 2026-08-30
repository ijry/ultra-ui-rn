/**
 * UPImage 组件示例 — 图片
 * 复刻 uview-plus u-image 页面结构
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPImage } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'src', type: 'string', default: '—', desc: '图片地址' },
 { prop: 'mode', type: 'string', default: "'aspectFill'", desc: '图片模式' },
 { prop: 'width', type: 'number | string', default: '—', desc: '宽度' },
 { prop: 'height', type: 'number | string', default: '—', desc: '高度' },
 { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '形状' },
 { prop: 'radius', type: 'number | string', default: '0', desc: '圆角' },
 { prop: 'showLoading', type: 'boolean', default: 'true', desc: '显示加载状态' },
 { prop: 'showError', type: 'boolean', default: 'true', desc: '显示错误状态' },
 { prop: 'fade', type: 'boolean', default: 'true', desc: '淡入动画' },
];

export default function ImageDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPImage src="https://picsum.photos/300/200?random=1" width={300} height={200} />
 </Section>

 <Section title="圆形">
 <View style={ig.row}>
 <UPImage src="https://picsum.photos/100/100?random=2" width={80} height={80} shape="circle" />
 <UPImage src="https://picsum.photos/100/100?random=3" width={80} height={80} shape="circle" />
 </View>
 </Section>

 <Section title="圆角">
 <UPImage src="https://picsum.photos/300/200?random=4" width={300} height={160} radius={12} />
 </Section>

 <Section title="不同尺寸">
 <View style={ig.row}>
 <UPImage src="https://picsum.photos/100/100?random=5" width={60} height={60} radius={4} />
 <UPImage src="https://picsum.photos/100/100?random=6" width={100} height={100} radius={8} />
 <UPImage src="https://picsum.photos/100/100?random=7" width={140} height={140} radius={12} />
 </View>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const ig = StyleSheet.create({
 row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingVertical: 8 },
});
