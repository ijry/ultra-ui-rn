/**
 * Row 行布局 & Col 列容器
 * 严格复刻 uview-plus pages/componentsC/layout/layout.nvue
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { UPCol, UPRow } from 'ultra-ui-rn';
import { DemoPage, Section } from '../_shared';

export default function RowDemo() {
  return (
    <DemoPage>
      <Section title="基础使用">
        <UPRow customStyle={s.mb10}>
          <UPCol span={6}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol span={6}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
        </UPRow>
        <UPRow customStyle={s.mb10}>
          <UPCol span={4}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
          <UPCol span={4}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol span={4}>
            <View style={[s.box, s.bgPurpleDark]} />
          </UPCol>
        </UPRow>
        <UPRow justify="space-between">
          <UPCol span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
        </UPRow>
      </Section>

      <Section title="分栏间隔">
        <UPRow gutter="10" justify="space-between">
          <UPCol span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
        </UPRow>
      </Section>

      <Section title="混合布局">
        <UPRow gutter="10" justify="space-between">
          <UPCol span={2}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol span={4}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
          <UPCol span={6}>
            <View style={[s.box, s.bgPurpleDark]} />
          </UPCol>
        </UPRow>
      </Section>

      <Section title="分栏偏移">
        <UPRow customStyle={s.mb10} justify="space-between">
          <UPCol offset={3} span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol offset={3} span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
        </UPRow>
        <UPRow>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol offset={3} span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
        </UPRow>
      </Section>

      <Section title="对齐方式">
        <UPRow customStyle={s.mb10} justify="space-between">
          <UPCol span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
        </UPRow>
        <UPRow>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurpleLight]} />
          </UPCol>
          <UPCol span={3}>
            <View style={[s.box, s.bgPurple]} />
          </UPCol>
        </UPRow>
      </Section>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  bgPurple: { backgroundColor: '#ced7e1' },
  bgPurpleDark: { backgroundColor: '#99a9bf' },
  bgPurpleLight: { backgroundColor: '#e5e9f2' },
  box: { borderRadius: 4, height: 25, width: '100%' },
  mb10: { marginBottom: 10 },
});
