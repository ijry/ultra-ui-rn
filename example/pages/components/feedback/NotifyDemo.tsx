/**
 * Notify 消息提示
 * 严格复刻 uview-plus pages/componentsB/notify/notify.nvue
 */
import React, { useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  UPCell,
  UPCellGroup,
  UPGap,
  UPNotify,
  type UPNotifyOptions,
  type UPNotifyRef,
} from 'ultra-ui-rn';

type NotifyEntry = { notifyData: UPNotifyOptions; title: string; iconUrl: string };

const list: NotifyEntry[] = [
  {
    notifyData: {
      message: 'notify顶部提示',
      type: 'primary',
      color: '#ffffff',
      bgColor: '',
      fontSize: 15,
      duration: 3000,
    },
    title: '主要通知',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/notify/main.png',
  },
  {
    notifyData: {
      message: 'notify顶部提示',
      type: 'success',
      color: '#ffffff',
      bgColor: '',
      fontSize: 15,
      duration: 3000,
      safeAreaInsetTop: false,
    },
    title: '成功通知',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/notify/success.png',
  },
  {
    notifyData: {
      message: 'notify顶部提示',
      type: 'error',
      color: '#ffffff',
      bgColor: '',
      fontSize: 14,
      duration: 3000,
      safeAreaInsetTop: false,
    },
    title: '危险通知',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/notify/error.png',
  },
  {
    notifyData: {
      message: 'notify顶部提示',
      type: 'warning',
      color: '#ffffff',
      bgColor: '',
      fontSize: 15,
      duration: 3000,
      safeAreaInsetTop: false,
    },
    title: '警告通知',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/notify/warning.png',
  },
  {
    notifyData: {
      message: 'notify顶部提示',
      color: '#fff',
      bgColor: '#000',
      fontSize: 15,
      duration: 3000,
      safeAreaInsetTop: false,
    },
    title: '自定义样式',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/notify/customStyle.png',
  },
  {
    notifyData: {
      message: 'notify顶部提示',
      type: 'primary',
      color: '#ffffff',
      bgColor: '',
      fontSize: 15,
      duration: 6000,
      safeAreaInsetTop: false,
    },
    title: '自定义时间',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/notify/customTime.png',
  },
  {
    notifyData: {
      message: 'notify顶部提示',
      color: '#fff',
      bgColor: '',
      fontSize: 15,
      duration: 3000,
      safeAreaInsetTop: true,
    },
    title: '插入状态栏高度',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/notify/height.png',
  },
];

export default function NotifyDemo() {
  const notify = useRef<UPNotifyRef>(null);

  const openNotify = (params: UPNotifyOptions) => {
    notify.current?.show({ ...params });
  };

  return (
    <View style={s.page}>
      <UPGap height={30} />
      <UPCellGroup>
        {list.map((item) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => openNotify(item.notifyData)}
            title={item.title}
            titleStyle={s.cellTitle}
          />
        ))}
      </UPCellGroup>
      <UPNotify ref={notify} />
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  cellTitle: { fontWeight: '500' },
  page: { flex: 1, padding: 0 },
});
