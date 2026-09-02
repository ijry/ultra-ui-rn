/**
 * Modal 模态框
 * 严格复刻 uview-plus pages/componentsC/modal/modal.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, Pressable, View } from 'react-native';
import { UPButton, UPCell, UPCellGroup, UPGap, UPIcon, UPModal } from 'ultra-ui-rn';
import { EventLog } from '../_shared';

const content = '模态框，常用于消息提示、消息确认、在当前页面内完成特定的交互操作';

const LOGO = 'https://uview-plus.jiangruyi.com/uview/common/logo.png';

const list = [
  { title: '基础使用', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/4.png' },
  { title: '无标题', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/5.png' },
  { title: '带取消按钮', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/2.png' },
  { title: '异步关闭', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/6.png' },
  { title: '对调取消和确认按钮', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/3.png' },
  { title: '允许点击遮罩关闭', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/7.png' },
  { title: '传入slot', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/1.png' },
  { title: '自定义按钮', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/8.png' },
  { title: '淡入淡出动画', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/9.png' },
  { title: '带底部关闭按钮', iconUrl: 'https://uview-plus.jiangruyi.com/uview/demo/modal/2.png' },
];

export default function ModalDemo() {
  const [active, setActive] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const log = (e: string) => setEvents((prev) => [...prev, e]);
  const close = () => setActive(0);

  // 源 asyncClose 场景：确认后 2 秒才真正关闭。
  const confirm4 = () => {
    setTimeout(close, 2000);
  };

  return (
    <View style={s.page}>
      <UPGap height={20} />
      <UPCellGroup>
        {list.map((item, index) => (
          <UPCell
            iconNode={<Image source={{ uri: item.iconUrl }} style={s.cellIcon} />}
            isLink
            key={item.title}
            onClick={() => setActive(index + 1)}
            title={item.title}
          />
        ))}
      </UPCellGroup>

      <UPModal
        content={content}
        contentTextAlign="left"
        onConfirm={close}
        show={active === 1}
        title="标题"
      />
      <UPModal content={content} onConfirm={close} show={active === 2} />
      <UPModal
        closeOnClickOverlay
        content={content}
        onCancel={() => { close(); log('cancel'); }}
        onClose={() => { close(); log('close'); }}
        onConfirm={() => { close(); log('confirm'); }}
        show={active === 3}
        showCancelButton
      />
      <UPModal
        asyncClose
        content={content}
        onCancel={close}
        onConfirm={confirm4}
        show={active === 4}
        showCancelButton
      />
      <UPModal
        buttonReverse
        content={content}
        onCancel={close}
        onConfirm={close}
        show={active === 5}
        showCancelButton
      />
      <UPModal
        closeOnClickOverlay
        content={content}
        onClose={close}
        onConfirm={close}
        show={active === 6}
        title="标题"
      />
      <UPModal
        closeOnClickOverlay
        onConfirm={close}
        show={active === 7}
        title="利剑出鞘,一统江湖"
      >
        <Image source={{ uri: LOGO }} style={s.logo} />
      </UPModal>
      <UPModal
        closeOnClickOverlay
        confirmButtonNode={
          <UPButton onClick={close} shape="circle" text="确定" type="success" />
        }
        content={content}
        show={active === 8}
        showCancelButton
        title="标题"
      />
      <UPModal
        content={content}
        onConfirm={close}
        show={active === 9}
        title="标题"
        zoom={false}
      />
      <UPModal
        content={content}
        onConfirm={close}
        popupBottomNode={
          <Pressable onPress={close} style={s.rounded}>
            <UPIcon color="#fff" name="close" />
          </Pressable>
        }
        show={active === 10}
        title="标题"
        zoom={false}
      />

      <EventLog events={events} />
    </View>
  );
}

const s = StyleSheet.create({
  cellIcon: { height: 18, marginRight: 4, width: 18 },
  logo: { height: 80, width: 80 },
  page: { flex: 1, padding: 0 },
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
});
