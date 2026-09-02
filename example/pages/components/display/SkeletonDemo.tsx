/**
 * Skeleton 骨架屏
 * 严格复刻 uview-plus pages/componentsC/skeleton/skeleton.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { UPGap, UPSkeleton, UPSwitch, UPText } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'loading', type: 'boolean', default: 'true', desc: '是否显示骨架占位（false 时渲染子内容）' },
  { prop: 'animate', type: 'boolean', default: 'false', desc: '是否开启闪烁动画' },
  { prop: 'rows', type: 'number | string', default: '0', desc: '段落占位行数' },
  { prop: 'rowsWidth', type: 'string | number | array', default: "'100%'", desc: '段落占位宽度' },
  { prop: 'rowsHeight', type: 'string | number | array', default: '18', desc: '段落占位高度' },
  { prop: 'title', type: 'boolean', default: 'true', desc: '是否显示标题占位' },
  { prop: 'titleWidth', type: 'string | number', default: "'50%'", desc: '标题占位宽度' },
  { prop: 'avatar', type: 'boolean', default: 'false', desc: '是否显示头像占位' },
  { prop: 'avatarSize', type: 'string | number', default: '32', desc: '头像占位大小' },
  { prop: 'avatarShape', type: "'circle' | 'square'", default: "'circle'", desc: '头像占位形状' },
];

/** Upstream loads `/static/uview/common/logo.png` from the uni-app project. */
const LOGO = 'https://uview-plus.jiangruyi.com/uview/common/logo.png';

export default function SkeletonDemo() {
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);

  return (
    <DemoPage>
      <Section title="基础使用">
        <UPSkeleton loading rows="3" title />
      </Section>

      <Section title="自定义段落行数">
        <UPSkeleton loading rows="2" title />
      </Section>

      <Section title="设置段落宽度">
        <UPSkeleton loading rows="2" rowsWidth={['100%', '35%']} title />
      </Section>

      <Section title="设置段落高度">
        <UPSkeleton
          loading
          rows="3"
          rowsHeight={['18px', '18px', '80px']}
          rowsWidth={['100%', '100%', '100%']}
          title
        />
      </Section>

      <Section contentStyle={s.transparent} title="是否开启动画">
        <UPSwitch
          inactiveColor="#e6e6e6"
          onChange={(next) => setSwitch1(Boolean(next))}
          space="2"
          value={switch1}
        />
        <UPGap height={15} />
        <View style={s.block}>
          <UPSkeleton animate={switch1} loading rows="3" title />
        </View>
      </Section>

      <Section contentStyle={s.transparent} title="展示头像">
        <UPGap height={15} />
        <View style={s.block}>
          <UPSkeleton animate={switch1} avatar loading rows="3" title />
        </View>
      </Section>

      <Section contentStyle={s.transparent} title="切换状态">
        <UPSwitch
          inactiveColor="#e6e6e6"
          onChange={(next) => setSwitch2(Boolean(next))}
          space="2"
          value={switch2}
        />
        <UPGap height={15} />
        <View style={s.block}>
          <UPSkeleton avatar loading={switch2} rows="2" rowsHeight="14" title>
            <View>
              <View style={s.slot}>
                <Image source={{ uri: LOGO }} style={s.slotImage} />
                <View style={s.slotContent}>
                  <UPText size="16" text="利剑出鞘,一统江湖" type="main" />
                  <UPText
                    customStyle={s.slotDesc}
                    size="14"
                    text="众多组件覆盖开发过程的各个需求，组件功能丰富，多端兼容。让您快速集成，开箱即用"
                    type="tips"
                  />
                </View>
              </View>
            </View>
          </UPSkeleton>
        </View>
        <UPGap bgColor="transparent" height={50} />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  block: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  slot: { alignItems: 'flex-start', flexDirection: 'row' },
  slotContent: { flex: 1, marginLeft: 10 },
  slotDesc: { marginTop: 5 },
  slotImage: { borderRadius: 100, height: 40, width: 40 },
  transparent: { backgroundColor: 'transparent', padding: 0 },
});
