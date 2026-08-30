/**
 * UPLineProgress 组件示例 — 线性进度条
 * 展示：基础、不同百分比、自定义颜色、显示文字、高度
 */
import React from 'react';
import { Text } from 'react-native';
import { UPLineProgress } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'percentage', type: 'number | string', default: '0', desc: '进度百分比(0-100)' },
 { prop: 'activeColor', type: 'string', default: '—', desc: '激活段颜色' },
 { prop: 'inactiveColor', type: 'string', default: '—', desc: '未激活段颜色' },
 { prop: 'showText', type: 'boolean', default: 'false', desc: '显示进度文字' },
 { prop: 'height', type: 'number | string', default: '—', desc: '进度条高度' },
 { prop: 'fromRight', type: 'boolean', default: 'false', desc: '从右到左' },
];

export default function LineProgressDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPLineProgress percentage={50} />
 </Section>

 <Section title="不同进度">
 <UPLineProgress percentage={20} />
 <Text style={{ height: 8 }} />
 <UPLineProgress percentage={50} />
 <Text style={{ height: 8 }} />
 <UPLineProgress percentage={80} />
 <Text style={{ height: 8 }} />
 <UPLineProgress percentage={100} />
 </Section>

 <Section title="显示文字">
 <UPLineProgress percentage={75} showText />
 </Section>

 <Section title="自定义颜色">
 <UPLineProgress percentage={60} activeColor="#07c160" inactiveColor="#e8f5e9" />
 <Text style={{ height: 8 }} />
 <UPLineProgress percentage={40} activeColor="#f56c6c" inactiveColor="#fde2e2" />
 </Section>

 <Section title="自定义高度">
 <UPLineProgress percentage={50} height={8} />
 <Text style={{ height: 8 }} />
 <UPLineProgress percentage={50} height={3} />
 </Section>

 <Section title="从右到左">
 <UPLineProgress percentage={65} fromRight />
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
