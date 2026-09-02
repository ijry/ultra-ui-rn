/**
 * Popup 弹出层
 * 严格复刻 uview-plus pages/componentsA/popup/popup.nvue
 */
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UPButton, UPCell, UPCellGroup, UPGap, UPIcon, UPPopup } from 'ultra-ui-rn';

type PopupData = {
  overlay?: boolean;
  mode?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  round?: number;
  closeable?: boolean;
  closeOnClickOverlay?: boolean;
  height?: string;
  touchable?: boolean;
  minHeight?: string;
  maxHeight?: string;
};

const list: Array<{ popupData: PopupData; title: string; iconUrl: string }> = [
  {
    popupData: { overlay: true, mode: 'top', closeOnClickOverlay: true },
    title: '顶部弹出',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/modeTop.png',
  },
  {
    popupData: { overlay: true, mode: 'right', closeOnClickOverlay: true },
    title: '右侧弹出',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/modeRight.png',
  },
  {
    popupData: { overlay: true, mode: 'bottom', closeOnClickOverlay: true },
    title: '底部弹出',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/modeBottom.png',
  },
  {
    popupData: { overlay: true, mode: 'left', closeOnClickOverlay: true },
    title: '左侧弹出',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/modeLeft.png',
  },
  {
    popupData: { overlay: true, mode: 'center', round: 10, closeOnClickOverlay: true },
    title: '居中弹出',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/modeCenter.png',
  },
  {
    popupData: { overlay: true, mode: 'bottom', round: 10, closeOnClickOverlay: true },
    title: '显示圆角',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/showRadis.png',
  },
  {
    popupData: { overlay: true, mode: 'bottom', closeable: false, closeOnClickOverlay: false },
    title: '禁止点击遮罩关闭',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/noClose.png',
  },
  {
    popupData: { overlay: true, mode: 'bottom', closeable: true, closeOnClickOverlay: true },
    title: '显示关闭按钮',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/showCloseBtn.png',
  },
  {
    popupData: {
      overlay: true,
      mode: 'bottom',
      height: '500px',
      touchable: true,
      minHeight: '150px',
      maxHeight: '80%',
      closeable: true,
      closeOnClickOverlay: true,
    },
    title: '底部弹出(支持手势)',
    iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/popup/showCloseBtn.png',
  },
];

const DEFAULT_DATA: PopupData = {
  overlay: true,
  mode: 'bottom',
  closeable: true,
  closeOnClickOverlay: true,
};

export default function PopupDemo() {
  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState<PopupData>(DEFAULT_DATA);

  const openPopup = (next: PopupData) => {
    setPopupData({ ...DEFAULT_DATA, ...next });
    setShow(true);
  };

  const horizontal = popupData.mode === 'left' || popupData.mode === 'right';
  const vertical = popupData.mode === 'bottom' || popupData.mode === 'top';

  return (
    <View>
      <UPGap height={20} />
      <UPCellGroup>
        {list.map((item) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => openPopup(item.popupData)}
            title={item.title}
            titleStyle={s.cellTitle}
          />
        ))}
      </UPCellGroup>

      {/* 源用 50 个 20px 空 view 撑高页面以验证滚动，这里用等高 Gap 代替。 */}
      <UPGap height={1000} />

      <UPPopup
        bottom={
          popupData.mode === 'center' ? (
            <View style={s.rounded}>
              <UPIcon color="#fff" name="close" />
            </View>
          ) : undefined
        }
        closeable={popupData.closeable}
        closeOnClickOverlay={popupData.closeOnClickOverlay}
        maxHeight={popupData.maxHeight}
        minHeight={popupData.minHeight}
        mode={popupData.mode}
        onChangeShow={setShow}
        onClose={() => setShow(false)}
        overlay={popupData.overlay}
        round={popupData.round}
        safeAreaInsetBottom
        safeAreaInsetTop
        show={show}
        touchable={popupData.touchable}
      >
        <View
          style={[
            s.slot,
            { marginTop: horizontal ? 240 : 0, width: vertical ? '100%' : 200 },
          ]}
        >
          <ScrollView style={[s.scroll, { height: popupData.height ? 160 : 80 }]}>
            {Array.from({ length: 30 }, (_, index) => (
              <Text key={index}>列表滚动{index + 1}</Text>
            ))}
          </ScrollView>
          <View>
            <UPButton
              customStyle={s.closeButton}
              onClick={() => setShow(false)}
              size="small"
              text="点我关闭"
              type="success"
            />
          </View>
        </View>
      </UPPopup>
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  cellTitle: { fontWeight: '500' },
  closeButton: { width: 100 },
  rounded: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: '#fff',
    borderRadius: 100,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    marginTop: 20,
    width: 32,
  },
  scroll: { marginBottom: 10, width: 120 },
  slot: { alignItems: 'center', flexDirection: 'column', justifyContent: 'center', padding: 12 },
});
