/**
 * UPIndexList 组件示例 — 索引列表
 * 展示：基础索引列表、自定义颜色、吸顶
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UPIndexList, UPIndexItem, UPIndexAnchor } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const INDEXES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

const PROPS = [
  { prop: 'indexList', type: 'string[]', default: 'A-Z', desc: '索引列表' },
  { prop: 'sticky', type: 'boolean', default: 'true', desc: '是否吸顶' },
  { prop: 'activeColor', type: 'string', default: '主题色', desc: '激活颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#999', desc: '未激活颜色' },
  { prop: 'onSelect', type: '(index) => void', default: '—', desc: '选中回调' },
];

export default function IndexListDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="IndexList 索引列表" onBack={onBack}>
      <Section title="基础用法">
        <UPIndexList
          indexList={INDEXES}
          height={300}
          sticky
          onSelect={(index) => console.log('select:', index)}
        >
          {INDEXES.map((letter) => (
            <UPIndexItem key={letter} index={letter}>
              <UPIndexAnchor text={letter} />
              {Array.from({ length: 3 }, (_, i) => (
                <View key={i} style={styles.item}>
                  <Text>{letter} 列表项 {i + 1}</Text>
                </View>
              ))}
            </UPIndexItem>
          ))}
        </UPIndexList>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const styles = StyleSheet.create({
  item: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
});
