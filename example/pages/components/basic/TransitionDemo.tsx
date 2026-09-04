/**
 * Transition 动画
 * 严格复刻 uview-plus pages/componentsA/transition/transition.nvue
 */
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  UPCell,
  UPCellGroup,
  UPGap,
  UPTransition,
  type UPTransitionMode,
} from 'ultra-ui-rn';
import { PropsTable } from '../_shared';

const PROPS = [
  { prop: 'show', type: 'boolean', default: 'false', desc: '是否展示组件' },
  { prop: 'mode', type: 'UPTransitionMode', default: "'fade'", desc: '动画模式，共 12 种' },
  { prop: 'duration', type: 'UPDimension', default: "'300'", desc: '动画时长，单位 ms' },
  { prop: 'timingFunction', type: 'string', default: "'ease-out'", desc: '动画过渡曲线（RN 实现固定用 Easing.out(Easing.ease)，无效）' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '动画容器自定义样式' },
  { prop: 'children', type: 'ReactNode', default: '—', desc: '动画内容（源默认插槽）' },
  { prop: 'onClick', type: '() => void', default: '—', desc: '点击动画内容时触发' },
  { prop: 'onBeforeEnter', type: '() => void', default: '—', desc: '进入前触发' },
  { prop: 'onEnter', type: '() => void', default: '—', desc: '进入中触发' },
  { prop: 'onAfterEnter', type: '() => void', default: '—', desc: '进入后触发' },
  { prop: 'onBeforeLeave', type: '() => void', default: '—', desc: '离开前触发' },
  { prop: 'onLeave', type: '() => void', default: '—', desc: '离开中触发' },
  { prop: 'onAfterLeave', type: '() => void', default: '—', desc: '离开后触发' },
];

const ICON = 'https://uview-plus.jiangruyi.com/uview/demo/transition/';

const list: Array<{ mode: UPTransitionMode; title: string; iconUrl: string }> = [
  { mode: 'fade', title: '淡入', iconUrl: `${ICON}fade.png` },
  { mode: 'fade-up', title: '上滑淡入', iconUrl: `${ICON}fadeUp.png` },
  { mode: 'zoom', title: '缩放', iconUrl: `${ICON}zoom.png` },
  { mode: 'fade-zoom', title: '缩放淡入', iconUrl: `${ICON}fadeZoom.png` },
  { mode: 'fade-down', title: '下滑淡入', iconUrl: `${ICON}fadeDown.png` },
  { mode: 'fade-left', title: '左滑淡入', iconUrl: `${ICON}fadeLeft.png` },
  { mode: 'fade-right', title: '右滑淡入', iconUrl: `${ICON}fadeRight.png` },
  { mode: 'slide-up', title: '上滑进入', iconUrl: `${ICON}slideUp.png` },
  { mode: 'slide-down', title: '下滑进入', iconUrl: `${ICON}slideDown.png` },
  { mode: 'slide-left', title: '左滑进入', iconUrl: `${ICON}slideLeft.png` },
  { mode: 'slide-right', title: '右滑进入', iconUrl: `${ICON}slideRight.png` },
];

export default function TransitionDemo() {
  // 源初始值为 mode = ''，本地 UPTransitionMode 用 'none' 表示"无动画"。
  const [mode, setMode] = useState<UPTransitionMode>('none');
  const [show, setShow] = useState(false);
  const { height, width } = useWindowDimensions();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const openTransition = (next: UPTransitionMode) => {
    setMode(next);
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 1500);
  };

  return (
    <View style={s.page}>
      <UPGap height={20} />
      <UPCellGroup border>
        {list.map((item) => (
          <UPCell
            clickable
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            key={item.mode}
            onClick={() => openTransition(item.mode)}
            title={item.title}
            titleStyle={s.cellTitle}
          />
        ))}
        {/*
          源 custom-style 用 position: fixed 把方块钉在视口中心；RN 没有 fixed，
          这里用 absolute（相对页面根节点），页面未滚动时视觉一致。
          七个事件回调只能做无副作用的输出：UPTransition 的 useEffect 依赖数组里
          带着每次渲染都新建的 input 对象，回调里 setState 会让 effect 反复重跑而死循环。
        */}
        <UPTransition
          customStyle={[s.transition, { left: width / 2 - 50, top: height / 2 - 50 }]}
          mode={mode}
          onAfterEnter={() => console.log('afterEnter')}
          onAfterLeave={() => console.log('afterLeave')}
          onBeforeEnter={() => console.log('beforeEnter')}
          onBeforeLeave={() => console.log('beforeLeave')}
          onClick={() => console.log('click')}
          onEnter={() => console.log('enter')}
          onLeave={() => console.log('leave')}
          show={show}
        >
          {/* 源 `.transition` 内层空 view，只有 $u-primary 背景、无尺寸。 */}
          <View style={s.transitionInner} />
        </UPTransition>
      </UPCellGroup>

      <View style={s.propsWrap}>
        <PropsTable rows={PROPS} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  /** 源 demo.scss `.u-cell-icon`：36rpx 见方，右外边距 8rpx。 */
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  cellTitle: { fontWeight: '500' },
  page: { flex: 1, padding: 0 },
  propsWrap: { paddingHorizontal: 15, paddingTop: 15 },
  transition: {
    backgroundColor: '#1989fa',
    height: 120,
    position: 'absolute',
    width: 120,
  },
  transitionInner: { backgroundColor: '#3c9cff' },
});
