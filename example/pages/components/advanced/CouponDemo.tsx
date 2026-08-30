/**
 * UPCoupon 组件示例 — 优惠券
 * 展示：基础、不同形状、自定义颜色、禁用
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPCoupon } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
 { prop: 'amount', type: 'string | number', default: '0', desc: '金额' },
 { prop: 'unit', type: 'string', default: "'¥'", desc: '单位符号' },
 { prop: 'title', type: 'string', default: '—', desc: '标题' },
 { prop: 'desc', type: 'string', default: '—', desc: '描述' },
 { prop: 'time', type: 'string', default: '—', desc: '有效期' },
 { prop: 'actionText', type: 'string', default: "'立即使用'", desc: '操作按钮文字' },
 { prop: 'shape', type: "'coupon' | 'circle'", default: "'coupon'", desc: '形状' },
 { prop: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'", desc: '尺寸' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'color', type: 'string', default: '主题色', desc: '主题颜色' },
];

export default function CouponDemo() {
 return (
 <DemoPage>
 <Section title="基础用法">
 <UPCoupon amount="100" title="满500减100" desc="全品类可用" time="2026.12.31" />
 </Section>

 <Section title="圆形">
 <UPCoupon amount="50" shape="circle" title="满200减50" />
 </Section>

 <Section title="小尺寸">
 <UPCoupon amount="20" size="small" title="满100减20" color="#67c23a" />
 </Section>

 <Section title="自定义颜色">
 <UPCoupon amount="200" color="#ff6600" title="大额优惠" desc="限时使用" />
 </Section>

 <Section title="禁用状态">
 <UPCoupon amount="88" title="满300减88" disabled desc="已过期" />
 </Section>

 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}
