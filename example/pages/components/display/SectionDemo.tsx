/**
 * UPSection 组件示例 — 内容 section
 * 复刻 uview-plus u-section 页面结构
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPSection } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const PROPS = [
  { prop: 'title', type: 'string | number', default: '—', desc: '标题' },
  { prop: 'subTitle', type: 'string | number', default: '—', desc: '副标题' },
  { prop: 'right', type: 'boolean', default: 'false', desc: '标题靠右' },
  { prop: 'fontSize', type: 'number', default: '15', desc: '标题字号' },
  { prop: 'bold', type: 'boolean', default: 'true', desc: '标题加粗' },
  { prop: 'color', type: 'string', default: "'#303133'", desc: '标题颜色' },
  { prop: 'showLine', type: 'boolean', default: 'true', desc: '显示左侧线条' },
  { prop: 'lineColor', type: 'string', default: '—', desc: '线条颜色' },
  { prop: 'arrow', type: 'boolean', default: 'false', desc: '显示右箭头' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '内容' },
  { prop: 'rightContent', type: 'ReactNode', default: '—', desc: '右侧自定义内容' },
];

export default function SectionDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Section 内容块" onBack={onBack}>
      <Section title="基础用法">
        <UPSection title="物流状态">
          <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
            <Text>快递信息展示区域</Text>
          </View>
        </UPSection>
      </Section>

      <Section title="副标题 + 右箭头">
        <UPSection title="我的订单" subTitle="查看全部" arrow>
          <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
            <Text>订单列表区域</Text>
          </View>
        </UPSection>
      </Section>

      <Section title="标题靠右">
        <UPSection title="右侧标题" right>
          <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
            <Text>内容区域</Text>
          </View>
        </UPSection>
      </Section>

      <Section title="自定义颜色和字号">
        <UPSection title="自定义样式" color="#3c9cff" fontSize={18} lineColor="#3c9cff">
          <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
            <Text>自定义颜色和字号</Text>
          </View>
        </UPSection>
      </Section>

      <Section title="无左侧线条">
        <UPSection title="无线条" showLine={false}>
          <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
            <Text>无左侧线条</Text>
          </View>
        </UPSection>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
