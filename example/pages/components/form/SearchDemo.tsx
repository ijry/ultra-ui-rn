/**
 * UPSearch 组件示例 — 搜索框
 * 展示：基础用法、圆形、操作按钮、自定义图标、禁用
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { UPSearch } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'value', type: 'string | number', default: '—', desc: '受控值（v-model）' },
 { prop: 'placeholder', type: 'string', default: '搜索', desc: '占位文本' },
 { prop: 'shape', type: 'round | square', default: 'round', desc: '形状' },
 { prop: 'showAction', type: 'boolean', default: 'false', desc: '显示右侧操作按钮' },
 { prop: 'actionText', type: 'string', default: '搜索', desc: '操作按钮文字' },
 { prop: 'clearabled', type: 'boolean', default: 'true', desc: '是否显示清除按钮' },
 { prop: 'disabled', type: 'boolean', default: 'false', desc: '是否禁用' },
 { prop: 'bgColor', type: 'string', default: '#f7f8fa', desc: '背景色' },
 { prop: 'iconPosition', type: 'left | right', default: 'left', desc: '图标位置' },
 { prop: 'onChange', type: '(value: string) => void', default: '—', desc: '值变化回调' },
 { prop: 'onSearch', type: '(value: string) => void', default: '—', desc: '搜索确认回调（回车/点击操作）' },
 { prop: 'onClear', type: '() => void', default: '—', desc: '清空回调' },
 { prop: 'onCustom', type: '(value: string) => void', default: '—', desc: '自定义操作按钮回调' },
];

export default function SearchDemo() {
 const [v1, setV1] = useState('');
 const [v2, setV2] = useState('');
 const [v3, setV3] = useState('');
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 {/* 1. 基础用法 */}
 <Section title="基础用法">
 <UPSearch
 placeholder="搜索商品"
 value={v1}
 onChange={(val) => { setV1(val); log(`onChange: ${val}`); }}
 onSearch={(val) => log(`onSearch: ${val}`)}
 onClear={() => { log('onClear'); setV1(''); }}
 />
 <Value label="当前值" value={v1} />
 </Section>

 {/* 2. 圆形（默认） vs 方形 */}
 <Section title="形状对比">
 <View style={{ marginBottom: 10 }}>
 <UPSearch placeholder="round（默认）" shape="round" />
 </View>
 <UPSearch placeholder="square" shape="square" />
 </Section>

 {/* 3. 带操作按钮 */}
 <Section title="带操作按钮">
 <UPSearch
 showAction
 actionText="取消"
 placeholder="搜索"
 value={v2}
 onChange={setV2}
 onCustom={(val) => log(`onCustom: ${val}`)}
 />
 </Section>

 {/* 4. 图标在右侧 */}
 <Section title="图标在右侧">
 <UPSearch placeholder="搜索" iconPosition="right" />
 </Section>

 {/* 5. label + 自定义背景 */}
 <Section title="label + 自定义背景">
 <UPSearch
 label="商品"
 bgColor="#ffffff"
 borderColor="#dcdfe6"
 placeholder="输入商品名"
 value={v3}
 onChange={setV3}
 />
 </Section>

 {/* 6. 禁用 */}
 <Section title="禁用">
 <UPSearch placeholder="搜索（禁用）" disabled />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
