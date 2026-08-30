/**
 * UPPullRefresh 组件示例 — 下拉刷新
 * 展示：基础下拉刷新
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPPullRefresh } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'refreshing', type: 'boolean', default: 'false', desc: '刷新状态' },
  { prop: 'threshold', type: 'number | string', default: '45', desc: '触发距离' },
  { prop: 'damping', type: 'number', default: '100', desc: '阻尼系数' },
  { prop: 'maxDistance', type: 'number | string', default: '100', desc: '最大下拉距离' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '内容' },
  { prop: 'onRefresh', type: '() => void', default: '—', desc: '刷新回调' },
];

export default function PullRefreshDemo({ onBack }: DemoProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setCount((c) => c + 1);
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <DemoPage title="PullRefresh 下拉刷新" onBack={onBack}>
      <Section title="下拉刷新">
        <UPPullRefresh refreshing={refreshing} onRefresh={handleRefresh}>
          <View style={pr.content}>
            <Text style={pr.text}>下拉刷新试试</Text>
            <Text style={pr.count}>已刷新 {count} 次</Text>
          </View>
        </UPPullRefresh>
      </Section>

      <Value label="刷新次数" value={count} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const pr = StyleSheet.create({
  content: { height: 300, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, color: '#333' },
  count: { fontSize: 14, color: '#999', marginTop: 8 },
});
