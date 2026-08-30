/**
 * UPEmpty 组件示例 — 空状态
 * 展示：基础、自定义文字、自定义图片
 */
import React from 'react';
import { Pressable, Text } from 'react-native';
import { UPEmpty } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'text', type: 'string', default: '暂无数据', desc: '提示文字' },
 { prop: 'icon', type: 'string', default: '—', desc: '自定义图标名' },
 { prop: 'iconSize', type: 'number | string', default: '—', desc: '图标大小' },
 { prop: 'iconColor', type: 'string', default: '—', desc: '图标颜色' },
 { prop: 'textColor', type: 'string', default: '—', desc: '文字颜色' },
 { prop: 'textSize', type: 'number | string', default: '—', desc: '文字大小' },
 { prop: 'image', type: 'string', default: '—', desc: '自定义图片 URL' },
 { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示' },
];

export default function EmptyDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPEmpty />
 </Section>

 <Section title="自定义文字">
 <UPEmpty text="没有找到相关商品" />
 </Section>

 <Section title="自定义文字颜色和大小">
 <UPEmpty text="暂无评论" textColor="#909399" textSize={14} />
 </Section>

 <Section title="网络错误空状态">
 <UPEmpty text="网络开小差了，点击重试" textColor="#f56c6c" />
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
