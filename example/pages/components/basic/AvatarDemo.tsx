/**
 * UPAvatar 组件示例 — 头像
 * 复刻 uview-plus pages/componentsC/avatar/avatar.nvue
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UPAvatar, UPAvatarGroup } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'src', type: 'string', default: '—', desc: '头像图片' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: '头像形状' },
  { prop: 'size', type: 'string | number', default: '40', desc: '头像尺寸' },
  { prop: 'mode', type: 'string', default: "'scaleToFill'", desc: '图片裁剪缩放模式' },
  { prop: 'text', type: 'string', default: '—', desc: '用文字替代图片' },
  { prop: 'bgColor', type: 'string', default: '#c0c4cc', desc: '背景颜色' },
  { prop: 'color', type: 'string', default: '#ffffff', desc: '文字颜色' },
  { prop: 'fontSize', type: 'string | number', default: '18', desc: '文字大小' },
  { prop: 'icon', type: 'string', default: '—', desc: '显示的图标' },
  { prop: 'mpAvatar', type: 'boolean', default: 'false', desc: '显示小程序头像，RN 无对应能力' },
  { prop: 'randomBgColor', type: 'boolean', default: 'false', desc: '是否随机背景色' },
  { prop: 'defaultUrl', type: 'string', default: '—', desc: '加载失败的默认头像' },
  { prop: 'colorIndex', type: 'string | number', default: '—', desc: '指定随机背景色的索引' },
  { prop: 'name', type: 'string', default: '—', desc: '组件标识符，随 click 回传' },
];

const src1 = 'https://uview-plus.jiangruyi.com/album/1.jpg';
const src2 = 'https://uview-plus.jiangruyi.com/album/2.jpg';
const src3 = 'https://uview-plus.jiangruyi.com/album/3.jpg';
const src4 = 'https://uview-plus.jiangruyi.com/album/4.jpg';
const src5 = 'https://uview-plus.jiangruyi.com/album/5.jpg';
const src6 = 'https://uview-plus.jiangruyi.com/album/6.jpg';
const src7 = 'https://uview-plus.jiangruyi.com/album/noExist.jpg';

const urls = [
  'https://uview-plus.jiangruyi.com/album/1.jpg',
  'https://uview-plus.jiangruyi.com/album/2.jpg',
  'https://uview-plus.jiangruyi.com/album/3.jpg',
  'https://uview-plus.jiangruyi.com/album/4.jpg',
  'https://uview-plus.jiangruyi.com/album/7.jpg',
  'https://uview-plus.jiangruyi.com/album/6.jpg',
  'https://uview-plus.jiangruyi.com/album/5.jpg',
];

/** Upstream wraps each avatar in `.u-avatar-item` (`margin-right: 30px`). */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function AvatarDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const log = (msg: string) => setEvents((prev) => [...prev, msg]);

  return (
    <DemoPage>
      <Section title="基础演示" direction="row">
        <UPAvatar src={src1} />
      </Section>

      <Section title="头像形状" direction="row">
        <Item>
          <UPAvatar src={src2} shape="circle" onClick={(name) => log(`click ${name}`)} />
        </Item>
        <Item>
          <UPAvatar src={src3} shape="square" />
        </Item>
      </Section>

      <Section title="头像尺寸" direction="row">
        <Item>
          <UPAvatar src={src4} size="30" />
        </Item>
        <Item>
          <UPAvatar src={src5} size="40" />
        </Item>
        <Item>
          <UPAvatar src={src6} size="50" />
        </Item>
      </Section>

      <Section title="图标头像" direction="row">
        <Item>
          <UPAvatar icon="red-packet-fill" fontSize="22" />
        </Item>
        <Item>
          <UPAvatar icon="star-fill" fontSize="22" />
        </Item>
      </Section>

      <Section title="文字头像(自动背景色)" direction="row">
        <Item>
          <UPAvatar text="U" fontSize="20" randomBgColor colorIndex={0} />
        </Item>
        <Item>
          <UPAvatar text="邓" fontSize="18" randomBgColor />
        </Item>
        <Item>
          <UPAvatar text="张" fontSize="18" randomBgColor />
        </Item>
        <Item>
          <UPAvatar text="王" fontSize="18" randomBgColor />
        </Item>
      </Section>

      <Section title="图片加载失败(显示默认头像)" direction="row">
        <UPAvatar src={src7} />
      </Section>

      <Section title="头像组">
        <UPAvatarGroup urls={urls} size="35" gap={0.4} />
        <View style={s.groupSpacing}>
          <UPAvatarGroup urls={urls} size="35" gap={0.6} />
        </View>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  groupSpacing: { marginTop: 20 },
  item: { marginRight: 30 },
});
