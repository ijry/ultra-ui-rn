/**
 * UPSkeleton 组件示例 — 骨架屏
 * 展示：基础行、标题+头像、自定义行列、加载完成切换
 */
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { UPSkeleton } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'loading', type: 'boolean', default: 'true', desc: '是否加载中' },
 { prop: 'rows', type: 'number | string', default: '3', desc: '行数' },
 { prop: 'rowsWidth', type: 'number | string | array', default: '100%', desc: '行宽度' },
 { prop: 'rowsHeight', type: 'number | string | array', default: '16', desc: '行高度' },
 { prop: 'title', type: 'boolean', default: 'false', desc: '显示标题占位' },
 { prop: 'titleWidth', type: 'number | string', default: '40%', desc: '标题宽度' },
 { prop: 'avatar', type: 'boolean', default: 'false', desc: '显示头像占位' },
 { prop: 'avatarSize', type: 'number | string', default: '64', desc: '头像大小' },
 { prop: 'avatarShape', type: 'circle | square', default: 'circle', desc: '头像形状' },
];

export default function SkeletonDemo() {
 const [loading, setLoading] = useState(true);

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPSkeleton rows={3} />
 </Section>

 <Section title="标题 + 头像">
 <UPSkeleton title avatar rows={2} />
 </Section>

 <Section title="圆形头像 + 自定义行数">
 <UPSkeleton title avatar avatarShape="circle" rows={4} titleWidth="60%" />
 </Section>

 <Section title="自定义行宽和高度">
 <UPSkeleton rows={3} rowsWidth={['80%', '60%', '90%']} rowsHeight={12} />
 </Section>

 <Section title="loading 切换">
 <Pressable
 onPress={() => setLoading((l) => !l)}
 style={{ alignItems: 'center', backgroundColor: '#3c9cff', borderRadius: 6, marginBottom: 12, paddingVertical: 8 }}
 >
 <Text style={{ color: '#fff' }}>切换 loading: {String(loading)}</Text>
 </Pressable>
 <UPSkeleton loading={loading} title avatar rows={2}>
 <View style={{ padding: 12 }}>
 <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>内容已加载</Text>
 <Text style={{ color: '#606266', lineHeight: 22 }}>
 这是真实内容，当 loading 为 false 时显示。
 </Text>
 </View>
 </UPSkeleton>
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
