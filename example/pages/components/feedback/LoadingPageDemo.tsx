/**
 * LoadingPage 加载页
 * 严格复刻 uview-plus pages/componentsA/loading-page/loading-page.nvue
 */
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { UPCell, UPCellGroup, UPGap, UPLoadingPage } from 'ultra-ui-rn';

type LoadingPageData = {
  loadingText?: string;
  image?: string;
  loadingMode?: 'spinner' | 'circle' | 'semicircle';
  bgColor?: string;
  iconSize?: number;
  color?: string;
  loadingColor?: string;
};

const list = [
  {
    title: '自定义提示内容',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/loading-page/promptContent.png',
  },
  {
    title: '自定义图片',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/loading-page/customPicture.png',
  },
  {
    title: '自定义加载动画模式',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/loading-page/customMode.png',
  },
  {
    title: '自定义背景色',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/loading-page/customBgColor.png',
  },
];

/** Upstream resets every field before applying the per-item overrides. */
const RESET: LoadingPageData = {
  loadingText: '',
  image: '',
  loadingMode: undefined,
  bgColor: '',
  iconSize: 28,
  color: '',
};

const PRESETS: LoadingPageData[] = [
  { loadingMode: 'semicircle', loadingText: 'Hello uview-plus', color: '#C8C8C8', loadingColor: '#C8C8C8' },
  // 源用 /static/uview/common/logo.png，本地示例改用同一张图的 CDN 地址。
  { image: 'https://uview-plus.jiangruyi.com/uview/common/logo.png', loadingText: 'uview-plus', iconSize: 40, color: '#C8C8C8', loadingColor: '#C8C8C8' },
  { loadingMode: 'circle', loadingText: 'uview-plus', color: '#C8C8C8', loadingColor: '#C8C8C8' },
  { loadingMode: 'spinner', bgColor: 'rgba(0, 0, 0, 0.3)', loadingText: 'uview-plus', color: '#eee', loadingColor: '#ddd' },
];

export default function LoadingPageDemo() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LoadingPageData>(RESET);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openLoadingPage = (index: number) => {
    setData({ ...RESET, ...PRESETS[index] });
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 2000);
  };

  return (
    <View style={s.page}>
      <UPGap height={20} />
      <UPCellGroup>
        {list.map((item, index) => (
          <UPCell
            iconNode={<Image resizeMode="contain" source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => openLoadingPage(index)}
            title={item.title}
            titleStyle={s.cellTitle}
          />
        ))}
      </UPCellGroup>

      <UPLoadingPage
        bgColor={data.bgColor}
        color={data.color}
        iconSize={data.iconSize}
        image={data.image}
        loading={loading}
        loadingColor={data.loadingColor}
        loadingMode={data.loadingMode}
        loadingText={data.loadingText}
      />
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 26, marginRight: 8, width: 26 },
  cellTitle: { fontWeight: '500' },
  page: { flex: 1 },
});
