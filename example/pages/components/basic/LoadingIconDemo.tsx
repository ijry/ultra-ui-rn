/**
 * LoadingIcon 加载动画
 * 严格复刻 uview-plus pages/componentsA/loading-icon/loading-icon.nvue
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { UPLoadingIcon } from 'ultra-ui-rn';
import { DemoPage, PropsTable, Section } from '../_shared';

const PROPS = [
  { prop: 'show', type: 'boolean', default: 'true', desc: '是否显示组件' },
  { prop: 'color', type: 'string', default: '#909399', desc: '动画活跃部分的颜色' },
  { prop: 'textColor', type: 'string', default: '#909399', desc: '提示文字颜色' },
  { prop: 'vertical', type: 'boolean', default: 'false', desc: '文字和图标是否垂直排列' },
  { prop: 'mode', type: "'spinner' | 'circle' | 'semicircle'", default: "'spinner'", desc: '模式选择（RN 用原生 ActivityIndicator，三种模式外观一致）' },
  { prop: 'size', type: 'UPDimension', default: '24', desc: '图标大小，>=28 时用 large 尺寸' },
  { prop: 'textSize', type: 'UPDimension', default: '15', desc: '文字大小' },
  { prop: 'text', type: 'string | number', default: "''", desc: '提示文字内容' },
  { prop: 'timingFunction', type: 'string', default: "'ease-in-out'", desc: '动画时间函数（RN 由平台控制，无效）' },
  { prop: 'duration', type: 'UPDimension', default: '1200', desc: '动画执行周期，单位 ms（RN 由平台控制，无效）' },
  { prop: 'inactiveColor', type: 'string', default: "''", desc: '非活跃部分颜色（RN ActivityIndicator 无此概念，无效）' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '组件根节点自定义样式' },
];

export default function LoadingIconDemo() {
  return (
    <DemoPage>
      <Section direction="row" title="基本案列">
        <View style={s.loadingItem}>
          <UPLoadingIcon />
        </View>
      </Section>

      <Section direction="row" title="半圆loading">
        <View style={s.loadingItem}>
          {/* mode 在 RN 版被标记为 deprecated：所有模式都渲染同一个 ActivityIndicator。 */}
          <UPLoadingIcon mode="semicircle" />
        </View>
      </Section>

      <Section direction="row" title="圆形loading">
        <View style={s.loadingItem}>
          <UPLoadingIcon mode="circle" />
        </View>
      </Section>

      <Section direction="row" title="自定义动画">
        <View style={s.loadingItem}>
          {/* timingFunction 同样是 RN 无效属性，原生动画曲线由平台决定。 */}
          <UPLoadingIcon mode="circle" timingFunction="linear" />
        </View>
      </Section>

      <Section direction="row" title="自定义颜色">
        <View style={s.loadingItem}>
          <UPLoadingIcon color="#19be6b" />
        </View>
      </Section>

      <Section direction="row" title="自定义文字">
        <View style={s.loadingItem}>
          <UPLoadingIcon text="加载中" vertical={true} />
        </View>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

/** 源 `.u-page__loading-item { margin-top: 5px }`。 */
const s = StyleSheet.create({
  loadingItem: { marginTop: 5 },
});
