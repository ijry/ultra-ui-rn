/**
 * Overlay 遮罩层
 * 严格复刻 uview-plus pages/componentsA/overlay/overlay.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { UPCell, UPOverlay, UPQrcode } from 'ultra-ui-rn';
import { PropsTable } from '../_shared';

const PROPS = [
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否显示遮罩' },
  { prop: 'zIndex', type: 'number | string', default: '10070', desc: '层级' },
  { prop: 'duration', type: 'number | string', default: '300', desc: '动画时长（RN 直接挂载/卸载，无过渡）' },
  { prop: 'opacity', type: 'number | string', default: '0.5', desc: '不透明度值，0-1 之间' },
  { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '定义需要用到的外部样式' },
  { prop: 'onClick', type: '() => void', default: '—', desc: '点击遮罩时触发' },
];

const list = [
  {
    title: '基本案列',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/overlay/baseCases.png',
  },
  {
    title: '嵌入内容',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/overlay/embeddedContent.png',
  },
  {
    title: '设置透明度',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/overlay/setTransparency.png',
  },
  {
    title: '嵌入二维码',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/qrcode.png',
  },
];

export default function OverlayDemo() {
  const [show, setShow] = useState(false);
  const [showSlot, setShowSlot] = useState(false);
  const [showOpcatiy, setShowOpcatiy] = useState(false);
  const [showQrcode, setShowQrcode] = useState(false);

  const openMask = (indexNum: number) => {
    if (indexNum === 0) setShow(!show);
    else if (indexNum === 1) setShowSlot(!showSlot);
    else if (indexNum === 2) setShowOpcatiy(!showOpcatiy);
    else if (indexNum === 3) setShowQrcode(!showQrcode);
  };

  return (
    <View style={s.page}>
      {list.map((item, index) => (
        <UPCell
          iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
          isLink
          key={item.title}
          onClick={() => openMask(index)}
          title={item.title}
          titleStyle={s.cellTitle}
        />
      ))}

      {/* RN 无 position: fixed，UPOverlay 铺满最近的父容器（此处即整页内容），
          而非视口；上游 .u-overlay 是固定定位。 */}
      <UPOverlay onClick={() => setShow(!show)} show={show} />

      <UPOverlay onClick={() => setShowSlot(!showSlot)} show={showSlot}>
        <View style={s.overlayWrap}>
          <View style={s.overlayWrapBox} />
        </View>
      </UPOverlay>
      <UPOverlay onClick={() => setShowOpcatiy(!showOpcatiy)} opacity=".85" show={showOpcatiy} />
      <UPOverlay onClick={() => setShowQrcode(false)} show={showQrcode}>
        <View style={s.overlayWrap}>
          <View style={s.overlayWrapQrcode}>
            <UPQrcode
              cid="overlay-qrcode"
              showLoading={false}
              size={180}
              val="https://click.meituan.com/t?t=1&c=2&p=WhaD2b5zGU-h"
            />
          </View>
        </View>
      </UPOverlay>

      <View style={s.propsWrap}>
        <PropsTable rows={PROPS} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  cellTitle: { fontWeight: '500' },
  overlayWrap: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  overlayWrapBox: { backgroundColor: '#70e1f5', height: 100, width: 100 },
  overlayWrapQrcode: { backgroundColor: '#ffffff', borderRadius: 4, padding: 20 },
  page: { flex: 1, padding: 0 },
  propsWrap: { paddingHorizontal: 15, paddingTop: 15 },
});
