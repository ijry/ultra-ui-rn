/**
 * Color 色彩
 * 严格复刻 uview-plus pages/componentsB/color/color.nvue
 *
 * 上游首页把这一条列在「基础组件」第一位，本地此前没有对应页面（索引里显示为
 * 「暂无本地 demo」）。8 个分区、29 个色块、每块的取值与文字色逐条照抄；
 * `u-tips-color`（浅底色块用 #909399 文字）也按上游逐块标注。
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DemoPage } from '../_shared';

interface Swatch {
  bg: string;
  label: string;
  /** 上游给浅色块加了 u-tips-color，文字改用 $u-tips-color 而非 #fff */
  tips?: boolean;
}

const SECTIONS: readonly { swatches: readonly Swatch[]; title: string }[] = [
  {
    title: '主色调',
    swatches: [
      { bg: '#3c9cff', label: 'Primary' },
      { bg: '#398ade', label: 'Dark' },
      { bg: '#9acafc', label: 'Disabled' },
      { bg: '#ecf5ff', label: 'Light', tips: true },
    ],
  },
  {
    title: 'Error',
    swatches: [
      { bg: '#f56c6c', label: 'Error' },
      { bg: '#e45656', label: 'Dark' },
      { bg: '#f7b2b2', label: 'Disabled' },
      { bg: '#fef0f0', label: 'Light', tips: true },
    ],
  },
  {
    title: 'Warning',
    swatches: [
      { bg: '#f9ae3d', label: 'Warning' },
      { bg: '#f1a532', label: 'Dark' },
      { bg: '#f9d39b', label: 'Disabled' },
      { bg: '#fdf6ec', label: 'Light', tips: true },
    ],
  },
  {
    title: 'Info',
    swatches: [
      { bg: '#909399', label: 'Info' },
      { bg: '#767a82', label: 'Dark' },
      { bg: '#c4c6c9', label: 'Disabled' },
      { bg: '#f4f4f5', label: 'Light', tips: true },
    ],
  },
  {
    title: 'Success',
    swatches: [
      { bg: '#5ac725', label: 'Success' },
      { bg: '#53c21d', label: 'Dark' },
      { bg: '#a9e08f', label: 'Disabled' },
      { bg: '#f5fff0', label: 'Light', tips: true },
    ],
  },
  {
    title: '文字颜色',
    swatches: [
      { bg: '#303133', label: '主要文字' },
      { bg: '#606266', label: '常规文字' },
      { bg: '#909399', label: '次要文字' },
      { bg: '#c0c4cc', label: '占位文字' },
    ],
  },
  {
    title: '边框颜色',
    swatches: [
      { bg: '#9a9998', label: '一级边框' },
      { bg: '#b4b3b1', label: '二级边框' },
      { bg: '#ceccca', label: '三级边框' },
      { bg: '#e7e6e4', label: '四级边框', tips: true },
    ],
  },
  {
    title: '背景颜色',
    swatches: [{ bg: '#f3f4f6', label: '背景颜色', tips: true }],
  },
];

export default function ColorDemo() {
  return (
    <DemoPage>
      <View style={s.page}>
        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={s.title}>{section.title}</Text>
            <View style={s.box}>
              {section.swatches.map((swatch) => (
                <View key={swatch.label} style={[s.item, { backgroundColor: swatch.bg }]}>
                  <Text style={[s.itemTitle, swatch.tips ? s.tips : null]}>{swatch.label}</Text>
                  <Text style={[s.itemValue, swatch.tips ? s.tips : null]}>{swatch.bg}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </DemoPage>
  );
}

// 上游 .u-page 用 15px 内补，色块 160rpx 宽（rpx 折半 → 80dp），圆角 3、上下 5px 内补
const s = StyleSheet.create({
  box: { flexDirection: 'row', justifyContent: 'space-between' },
  item: {
    alignItems: 'center',
    borderRadius: 3,
    justifyContent: 'center',
    paddingVertical: 5,
    width: 80,
  },
  itemTitle: { color: '#ffffff', fontSize: 13 },
  itemValue: { color: '#ffffff', fontSize: 14 },
  page: { padding: 15 },
  tips: { color: '#909399' },
  title: { color: '#606266', fontSize: 15, marginBottom: 4, marginTop: 16 },
});
