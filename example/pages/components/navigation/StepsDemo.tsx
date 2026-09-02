/**
 * Steps 步骤条
 * 严格复刻 uview-plus pages/componentsC/steps/steps.vue
 */
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { UPSteps, UPStepsItem } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'current', type: 'number | string', default: '0', desc: '设置当前处于第几步' },
  { prop: 'direction', type: "'row' | 'column'", default: "'row'", desc: '步骤条方向' },
  { prop: 'activeColor', type: 'string', default: '#3c9cff', desc: '激活状态颜色' },
  { prop: 'inactiveColor', type: 'string', default: '#969799', desc: '未激活状态颜色' },
  { prop: 'activeIcon', type: 'string', default: '—', desc: '激活状态的图标' },
  { prop: 'inactiveIcon', type: 'string', default: '—', desc: '未激活状态的图标' },
  { prop: 'dot', type: 'boolean', default: 'false', desc: '是否显示点类型' },
  { prop: 'title', type: 'string', default: '—', desc: '标题（StepsItem）' },
  { prop: 'desc', type: 'string', default: '—', desc: '描述文字（StepsItem）' },
  { prop: 'error', type: 'boolean', default: 'false', desc: '当前步骤是否为错误状态（StepsItem）' },
  { prop: 'iconNode', type: 'ReactNode', default: '—', desc: '自定义图标（源 icon 插槽）' },
];

export default function StepsDemo() {
  const [current1] = useState(1);

  return (
    <DemoPage>
      <Section title="基础演示">
        <UPSteps current={current1}>
          <UPStepsItem desc="10:30" itemStyle={s.firstItem} title="已下单" />
          <UPStepsItem desc="10:35" title="已出库" />
          <UPStepsItem desc="11:40" title="运输中" />
          <UPStepsItem desc="19:50" title="已签收" />
          <UPStepsItem desc="20:10" title="已拒收" />
          <UPStepsItem desc="23:20" title="已退回" />
        </UPSteps>
      </Section>

      <Section title="显示点类型">
        <UPSteps current={1} dot>
          <UPStepsItem desc="10:30" title="已下单" />
          <UPStepsItem desc="10:35" title="已出库" />
          <UPStepsItem desc="11:40" title="运输中" />
        </UPSteps>
        <UPSteps current={1} direction="column" dot>
          <UPStepsItem desc="10:30" title="已下单" />
          <UPStepsItem desc="10:35" title="已出库" />
          <UPStepsItem desc="11:40" title="运输中" />
        </UPSteps>
      </Section>

      <Section title="错误状态">
        <UPSteps current={1}>
          <UPStepsItem desc="10:30" title="已下单" />
          <UPStepsItem desc="10:35" error title="仓库着火" />
          <UPStepsItem desc="11:40" title="破产清算" />
        </UPSteps>
      </Section>

      <Section title="自定义图标">
        <UPSteps activeIcon="checkmark" current={1} inactiveIcon="arrow-right">
          <UPStepsItem desc="10:30" title="已下单" />
          <UPStepsItem desc="10:35" title="已出库" />
          <UPStepsItem desc="11:40" title="运输中" />
        </UPSteps>
      </Section>

      <Section title="自定义插槽">
        <UPSteps current={1}>
          <UPStepsItem desc="10:30" title="已下单" />
          <UPStepsItem desc="10:35" title="已出库" />
          <UPStepsItem desc="11:40" iconNode={<Text style={s.slotIcon}>运</Text>} title="运输中" />
        </UPSteps>
      </Section>

      <Section title="自定义颜色">
        <UPSteps activeColor="#3c9cff" current={1}>
          <UPStepsItem desc="10:30" title="已下单" />
          <UPStepsItem desc="10:35" title="已出库" />
          <UPStepsItem desc="11:40" title="运输中" />
        </UPSteps>
      </Section>

      <Section title="竖向展示">
        <UPSteps current={1} direction="column">
          <UPStepsItem desc="10:30" title="已下单" />
          <UPStepsItem desc="10:35" title="已出库" />
          <UPStepsItem desc="11:40" title="运输中" />
        </UPSteps>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  firstItem: { backgroundColor: '#eee' },
  slotIcon: {
    backgroundColor: '#f9ae3d',
    borderRadius: 100,
    color: '#fff',
    fontSize: 12,
    height: 21,
    lineHeight: 21,
    textAlign: 'center',
    width: 21,
  },
});
