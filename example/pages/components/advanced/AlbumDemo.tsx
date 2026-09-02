/**
 * Album 相册
 * 严格复刻 uview-plus pages/componentsC/album/album.nvue
 */
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { UPAlbum, UPText, toast } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'urls', type: 'Array<string | object>', default: '[]', desc: '图片地址列表' },
  { prop: 'keyName', type: 'string', default: '—', desc: 'urls 为对象数组时的图片字段名' },
  { prop: 'singleSize', type: 'number | string', default: '180', desc: '单图时的最大宽高' },
  { prop: 'multipleSize', type: 'number | string', default: '70', desc: '多图时的宽高' },
  { prop: 'space', type: 'number | string', default: '6', desc: '图片之间的间距' },
  { prop: 'singleMode', type: 'string', default: "'scaleToFill'", desc: '单图时的裁剪模式' },
  { prop: 'multipleMode', type: 'string', default: "'aspectFill'", desc: '多图时的裁剪模式' },
  { prop: 'maxCount', type: 'number | string', default: '9', desc: '最多展示的图片数量' },
  { prop: 'rowCount', type: 'number | string', default: '3', desc: '每行展示的图片数量' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '图片形状' },
  { prop: 'radius', type: 'number | string', default: '2', desc: '图片圆角' },
  { prop: 'autoWrap', type: 'boolean', default: 'false', desc: '是否每行占满自动换行' },
  { prop: 'onAlbumWidth', type: '(width: number) => void', default: '—', desc: '相册整体宽度变化时触发' },
];

const LOGO = 'https://uview-plus.jiangruyi.com/uview/common/logo.png';
const album = (n: number) => `https://uview-plus.jiangruyi.com/uview/album/${n}.jpg`;

const urls1 = [{ src2: album(1) }];
const urls2 = Array.from({ length: 10 }, (_, index) => album(index + 1));
const urls3 = [album(5), album(6), album(7), album(8)];
const urls4 = [album(7), album(8), album(9), album(10)];

const DESC = '全面的组件和便捷的工具会让您信手拈来，如鱼得水';

/** Upstream `.album` row: avatar on the left, texts + album on the right. */
function AlbumRow({ children, descWidth }: { children: React.ReactNode; descWidth?: number }) {
  return (
    <View style={s.album}>
      <View style={s.avatar}>
        <Image source={{ uri: LOGO }} style={s.logo} />
      </View>
      <View style={s.content}>
        <UPText bold size="17" text="uview-plus" type="primary" />
        {descWidth === undefined ? (
          <UPText customStyle={s.desc} text={DESC} />
        ) : (
          <View style={[s.descWrap, { width: descWidth }]}>
            <UPText customStyle={{ width: descWidth }} text={DESC} />
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

export default function AlbumDemo() {
  const [albumWidth, setAlbumWidth] = useState(0);

  return (
    <DemoPage>
      <Section title="基础使用">
        <AlbumRow>
          <UPAlbum keyName="src2" onPreview={() => toast.default('test')} urls={urls1} />
        </AlbumRow>
      </Section>

      <Section title="多图模式">
        <AlbumRow>
          <UPAlbum urls={urls2} />
        </AlbumRow>
      </Section>

      <Section title="图文对齐">
        <AlbumRow descWidth={albumWidth}>
          <UPAlbum multipleSize="68" onAlbumWidth={setAlbumWidth} urls={urls2} />
        </AlbumRow>
      </Section>

      <Section title="更改裁剪模式">
        <AlbumRow>
          <UPAlbum maxCount="4" multipleMode="scaleToFill" rowCount="2" urls={urls3} />
        </AlbumRow>
      </Section>

      <Section title="更改图片大小">
        <AlbumRow>
          <UPAlbum maxCount="4" multipleSize="50" rowCount="2" urls={urls4} />
        </AlbumRow>
      </Section>

      <Section title="自定义圆角">
        <AlbumRow>
          <UPAlbum radius="10" urls={urls2} />
        </AlbumRow>
      </Section>

      <Section title="自定义形状">
        <AlbumRow>
          <UPAlbum shape="circle" urls={urls2} />
        </AlbumRow>
      </Section>

      <Section title="自适应自动换行">
        <AlbumRow>
          <UPText customStyle={s.desc} text="每行占满自动换行(不受rowCount限制)" />
          <UPAlbum autoWrap maxCount={9} urls={urls2} />
        </AlbumRow>
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  album: { alignItems: 'flex-start', flexDirection: 'row' },
  avatar: { backgroundColor: '#f3f4f6', borderRadius: 3, padding: 5 },
  content: { flex: 1, marginLeft: 10 },
  desc: { marginBottom: 8 },
  descWrap: { marginBottom: 8 },
  logo: { height: 32, width: 32 },
});
