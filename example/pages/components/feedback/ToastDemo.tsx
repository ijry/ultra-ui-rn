/**
 * Toast 消息提示
 * 严格复刻 uview-plus pages/componentsB/toast/toast.nvue
 */
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  UPCell,
  UPCellGroup,
  UPGap,
  UPToast,
  type UPToastOptions,
  type UPToastRef,
} from 'ultra-ui-rn';
import { EventLog } from '../_shared';

type ToastEntry = UPToastOptions & { title: string; iconUrl: string };

const list: ToastEntry[] = [
  {
    type: 'default',
    title: '默认主题',
    message: '锦瑟无端五十弦',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/default.png',
  },
  {
    type: 'error',
    icon: false,
    title: '失败主题(不带图标)',
    message: '一弦一柱思华年',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/error.png',
  },
  {
    type: 'success',
    title: '成功主题(带图标)',
    message: '庄生晓梦迷蝴蝶',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/success.png',
  },
  {
    type: 'warning',
    position: 'top',
    title: '位置偏移上方',
    message: '望帝春心托杜鹃',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/top.png',
  },
  {
    type: 'loading',
    title: '正在加载',
    message: '正在加载',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/loading.png',
  },
  {
    type: 'default',
    title: '结束后跳转标签页',
    message: '此情可待成追忆',
    url: '/pages/componentsB/tag/tag',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/jump.png',
  },
  {
    type: 'default',
    title: '其它icon图标',
    icon: 'photo',
    message: '只是当时已惘然',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/default.png',
  },
  {
    type: 'default',
    title: '自定义图片图标',
    icon: 'https://uview-plus.jiangruyi.com/uview/demo/toast/jump.png',
    message: '只是当时已惘然',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/toast/default.png',
  },
];

export default function ToastDemo() {
  const toast = useRef<UPToastRef>(null);
  const [events, setEvents] = useState<string[]>([]);

  const showToast = (entry: ToastEntry) => {
    const { title, iconUrl, url, ...options } = entry;
    toast.current?.show({
      ...options,
      overlay: true,
      // 源在 complete 里 uni.navigateTo；RN 侧无页面栈，记录到事件日志。
      complete: () => {
        if (url) setEvents((prev) => [...prev, `complete → ${url}`]);
      },
    });
  };

  return (
    <View style={s.page}>
      <UPGap height={30} />
      <UPToast ref={toast} />
      <UPCellGroup>
        {list.map((item) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => showToast(item)}
            title={item.title}
            titleStyle={s.cellTitle}
          />
        ))}
      </UPCellGroup>
      <EventLog events={events} />
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  cellTitle: { fontWeight: '500' },
  page: { flex: 1, padding: 0 },
});
