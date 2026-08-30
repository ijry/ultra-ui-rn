/**
 * UPAvatarGroup 组件示例 — 头像组
 * 复刻 uview-plus u-avatar-group 页面结构
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPAvatarGroup } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'urls', type: 'AvatarGroupItem[]', default: '[]', desc: '头像数据' },
 { prop: 'maxCount', type: 'number | string', default: '—', desc: '最大显示数' },
 { prop: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: '形状' },
 { prop: 'size', type: 'number | string', default: '32', desc: '头像大小' },
 { prop: 'gap', type: 'number', default: '-10', desc: '间距(负值重叠)' },
 { prop: 'showMore', type: 'boolean', default: 'false', desc: '显示更多提示' },
 { prop: 'extraValue', type: 'number | string', default: '—', desc: '额外数量' },
 { prop: 'onShowMore', type: '() => void', default: '—', desc: '点击更多回调' },
];

const AVATARS = [
 { url: 'https://picsum.photos/100/100?random=1' },
 { url: 'https://picsum.photos/100/100?random=2' },
 { url: 'https://picsum.photos/100/100?random=3' },
 { url: 'https://picsum.photos/100/100?random=4' },
 { url: 'https://picsum.photos/100/100?random=5' },
 { url: 'https://picsum.photos/100/100?random=6' },
];

export default function AvatarGroupDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPAvatarGroup urls={AVATARS.slice(0, 3)} />
 </Section>

 <Section title="限制显示数量">
 <UPAvatarGroup urls={AVATARS} maxCount={3} />
 </Section>

 <Section title="显示更多 + 额外数量">
 <UPAvatarGroup urls={AVATARS} maxCount={3} showMore extraValue="+10" />
 </Section>

 <Section title="方形头像组">
 <UPAvatarGroup urls={AVATARS.slice(0, 4)} shape="square" size={40} gap={-8} />
 </Section>

 <Section title="自定义大小">
 <View style={ag.section}>
 <UPAvatarGroup urls={AVATARS.slice(0, 3)} size={24} />
 <UPAvatarGroup urls={AVATARS.slice(0, 3)} size={40} />
 <UPAvatarGroup urls={AVATARS.slice(0, 3)} size={56} />
 </View>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const ag = StyleSheet.create({
 section: { gap: 12, paddingVertical: 4 },
});
