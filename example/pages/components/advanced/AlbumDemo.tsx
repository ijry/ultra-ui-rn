/**
 * UPAlbum 组件示例 — 相册
 * 展示：多图展示、单图模式、自定义行列、圆形、预览
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPAlbum } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, EventLog, type DemoProps } from '../_shared';

const IMAGES = [
  { url: 'https://picsum.photos/400/300?random=1' },
  { url: 'https://picsum.photos/400/300?random=2' },
  { url: 'https://picsum.photos/400/300?random=3' },
  { url: 'https://picsum.photos/400/300?random=4' },
  { url: 'https://picsum.photos/400/300?random=5' },
  { url: 'https://picsum.photos/400/300?random=6' },
];

const PROPS = [
  { prop: 'urls', type: 'UPAlbumItem[]', default: '[]', desc: '图片数据' },
  { prop: 'rowCount', type: 'number | string', default: '3', desc: '每行图片数' },
  { prop: 'maxCount', type: 'number | string', default: '9', desc: '最大展示数' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '图片形状' },
  { prop: 'radius', type: 'UPDimension', default: '4', desc: '圆角大小' },
  { prop: 'space', type: 'UPDimension', default: '4', desc: '图片间距' },
  { prop: 'previewFullImage', type: 'boolean', default: 'true', desc: '是否支持全屏预览' },
  { prop: 'showMore', type: 'boolean', default: 'false', desc: '是否显示更多提示' },
];

export default function AlbumDemo({ onBack }: DemoProps) {
  const [events, setEvents] = useState<string[]>([]);

  return (
    <DemoPage title="Album 相册" onBack={onBack}>
      <Section title="基础用法（3列）">
        <UPAlbum urls={IMAGES.slice(0, 3)} rowCount={3} />
      </Section>

      <Section title="4列 + 最多6张">
        <UPAlbum urls={IMAGES} rowCount={4} maxCount={6} />
      </Section>

      <Section title="圆形 + 间距8">
        <UPAlbum urls={IMAGES.slice(0, 4)} rowCount={2} shape="circle" space={8} />
      </Section>

      <Section title="显示更多 + 2列">
        <UPAlbum urls={IMAGES} rowCount={2} maxCount={4} showMore />
      </Section>

      <Section title="单图大图">
        <UPAlbum urls={[IMAGES[0]]} singleSize={200} />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
