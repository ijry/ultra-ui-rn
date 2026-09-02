/**
 * Divider 分割线
 * 严格复刻 uview-plus pages/componentsA/divider/divider.nvue
 */
import React from 'react';
import { View } from 'react-native';
import { UPDivider } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'text', type: 'string | number', default: '—', desc: '文字内容' },
  { prop: 'dashed', type: 'boolean', default: 'false', desc: '是否虚线' },
  { prop: 'hairline', type: 'boolean', default: 'true', desc: '是否细线' },
  { prop: 'dot', type: 'boolean', default: 'false', desc: '是否以点代替文字' },
  { prop: 'textPosition', type: "'left' | 'center' | 'right'", default: "'center'", desc: '文字位置' },
  { prop: 'textSize', type: 'number | string', default: '14', desc: '文字大小' },
  { prop: 'textColor', type: 'string', default: '#909399', desc: '文字颜色' },
  { prop: 'lineColor', type: 'string', default: '#dcdfe6', desc: '线条颜色' },
  { prop: 'onClick', type: '() => void', default: '—', desc: '点击组件时触发' },
];

export default function DividerDemo() {
  return (
    <DemoPage>
      <Section title="基本案例">
        <View>
          <UPDivider text="分割线" />
        </View>
      </Section>

      <Section title="是否虚线">
        <View>
          <UPDivider dashed text="分割线" />
        </View>
      </Section>

      <Section title="是否细线">
        <View>
          <UPDivider hairline text="分割线" />
        </View>
      </Section>

      <Section title="是否以点代替文字">
        <View>
          <UPDivider dot text="分割线" />
        </View>
      </Section>

      <Section title="文本内容靠左">
        <View>
          <UPDivider text="分割线" textPosition="left" />
        </View>
      </Section>

      <Section title="文本内容靠右">
        <View>
          <UPDivider text="分割线" textPosition="right" />
        </View>
      </Section>

      <Section title="自定义文本颜色">
        <View>
          <UPDivider lineColor="#2979ff" text="分割线" textColor="#2979ff" />
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
