/**
 * UPCountTo 组件示例 — 数字滚动
 * 展示：基础、自定义范围、小数、自定义时长
 */
import React from 'react';
import { UPCountTo } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'startVal', type: 'number | string', default: '0', desc: '起始值' },
 { prop: 'endVal', type: 'number | string', default: '0', desc: '结束值' },
 { prop: 'duration', type: 'number | string', default: '3000', desc: '动画时长(ms)' },
 { prop: 'autoplay', type: 'boolean', default: 'true', desc: '自动播放' },
 { prop: 'decimals', type: 'number | string', default: '0', desc: '小数位数' },
 { prop: 'decimal', type: 'string', default: '.', desc: '小数点符号' },
 { prop: 'separator', type: 'string', default: ',', desc: '千位分隔符' },
 { prop: 'color', type: 'string', default: '—', desc: '文字颜色' },
 { prop: 'fontSize', type: 'number | string', default: '—', desc: '字体大小' },
 { prop: 'bold', type: 'boolean', default: 'false', desc: '加粗' },
];

export default function CountToDemo() {
 return (
 <DemoPage>
 <Section title="基础用法（0 → 100）">
 <UPCountTo endVal={100} />
 </Section>

 <Section title="大数字 + 千位分隔符">
 <UPCountTo endVal={123456} separator="," />
 </Section>

 <Section title="自定义范围（1000 → 0）">
 <UPCountTo startVal={1000} endVal={0} duration={2000} />
 </Section>

 <Section title="小数">
 <UPCountTo endVal={3.14} decimals={2} duration={1500} />
 </Section>

 <Section title="自定义颜色和大小">
 <UPCountTo endVal={9999} color="#f56c6c" fontSize={28} bold />
 </Section>

 <Section title="慢速动画（5秒）">
 <UPCountTo endVal={200} duration={5000} />
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
