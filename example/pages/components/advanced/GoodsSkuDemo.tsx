/**
 * UPGoodsSku 组件示例 — 商品规格选择
 * 展示：基础用法
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPGoodsSku } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const SKU_TREE = [
 { name: '颜色', children: [{ id: 'red', name: '红色' }, { id: 'blue', name: '蓝色' }, { id: 'green', name: '绿色' }] },
 { name: '尺码', children: [{ id: 'S', name: 'S' }, { id: 'M', name: 'M' }, { id: 'L', name: 'L' }, { id: 'XL', name: 'XL' }] },
];

const SKU_LIST = [
 { color: '红色', size: 'S', price: 99, stock: 10 },
 { color: '红色', size: 'M', price: 99, stock: 5 },
 { color: '蓝色', size: 'S', price: 109, stock: 8 },
 { color: '蓝色', size: 'M', price: 109, stock: 12 },
 { color: '绿色', size: 'L', price: 119, stock: 0 },
 { color: '绿色', size: 'XL', price: 119, stock: 3 },
];

const PROPS = [
 { prop: 'goodsInfo', type: 'object', default: '—', desc: '商品信息' },
 { prop: 'skuTree', type: 'SkuTreeItem[]', default: '[]', desc: '规格树' },
 { prop: 'skuList', type: 'SkuComb[]', default: '[]', desc: 'SKU组合' },
 { prop: 'maxBuy', type: 'number', default: '—', desc: '最大购买数' },
 { prop: 'confirmText', type: 'string', default: "'确认'", desc: '确认按钮文字' },
 { prop: 'closeable', type: 'boolean', default: 'true', desc: '可关闭' },
 { prop: 'renderTrigger', type: '() => ReactNode', default: '—', desc: '触发器渲染' },
];

export default function GoodsSkuDemo() {
 const [events, setEvents] = useState<string[]>([]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPGoodsSku
 goodsInfo={{ name: '测试商品', price: 99 }}
 skuTree={SKU_TREE}
 skuList={SKU_LIST}
 renderTrigger={() => (
 <View style={styles.trigger}>
 <Text style={styles.triggerText}>选择规格</Text>
 </View>
 )}
 onOpen={() => setEvents((e) => [...e, 'open'])}
 
 onConfirm={(data: any) => setEvents((e) => [...e, `confirm: ${JSON.stringify(data)}`])}
 />
 </Section>

 <EventLog events={events} />
 <PropsTable rows={PROPS} />
 </DemoPage>
 );
}

const styles = StyleSheet.create({
 trigger: { backgroundColor: '#3c9cff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, alignSelf: 'flex-start' },
 triggerText: { color: '#fff', fontSize: 14 },
});
