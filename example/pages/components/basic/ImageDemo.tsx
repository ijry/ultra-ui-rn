/**
 * UPImage 组件示例 — 图片
 * 复刻 uview-plus pages/componentsA/image/image.nvue
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UPImage, UPLoadingIcon } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'src', type: 'string', default: '—', desc: '图片地址' },
  { prop: 'mode', type: 'string', default: "'aspectFill'", desc: '裁剪、缩放模式' },
  { prop: 'width', type: 'string | number', default: "'300'", desc: '宽度' },
  { prop: 'height', type: 'string | number', default: "'225'", desc: '高度' },
  { prop: 'shape', type: "'circle' | 'square'", default: "'square'", desc: '图片形状' },
  { prop: 'radius', type: 'string | number', default: '0', desc: '圆角值' },
  { prop: 'loadingIcon', type: 'string', default: "'photo'", desc: '加载中的图标' },
  { prop: 'errorIcon', type: 'string', default: "'error-circle'", desc: '加载失败的图标' },
  { prop: 'showLoading', type: 'boolean', default: 'true', desc: '是否显示加载中的图标' },
  { prop: 'showError', type: 'boolean', default: 'true', desc: '是否显示加载错误的图标' },
  { prop: 'fade', type: 'boolean', default: 'true', desc: '是否需要淡入效果' },
  { prop: 'duration', type: 'string | number', default: '500', desc: '淡入过渡时间，单位 ms' },
  { prop: 'bgColor', type: 'string', default: "'#f3f4f6'", desc: '背景颜色' },
  { prop: 'lazyLoad', type: 'boolean', default: 'true', desc: '是否懒加载（RN 无对应能力，no-op）' },
  { prop: 'webp', type: 'boolean', default: 'false', desc: '是否解析 webp 格式（RN 无对应能力，no-op）' },
];

const SRC = 'https://uview-plus.jiangruyi.com/uview/album/1.jpg';

/** Upstream wraps every image in `.u-page__image-item`. */
function Item({ children }: { children: React.ReactNode }) {
  return <View style={s.item}>{children}</View>;
}

export default function ImageDemo() {
  const [events, setEvents] = useState<string[]>([]);
  const [src1, setSrc1] = useState('');
  const log = (msg: string) => setEvents((prev) => [...prev, msg]);

  useEffect(() => {
    const timer = setTimeout(() => setSrc1(SRC), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DemoPage>
      <Section title="基本案例">
        <Item>
          <UPImage
            showLoading
            src={SRC}
            width="80px"
            height="80px"
            onClick={() => log('click')}
          />
        </Item>
      </Section>

      <Section title="自定义形状">
        <Item>
          <UPImage shape="circle" src={SRC} width="80px" height="80px" />
        </Item>
      </Section>

      <Section title="自定义圆角">
        <Item>
          <UPImage radius="12" src={SRC} width="80px" height="80px" />
        </Item>
      </Section>

      <Section title="宽度100%">
        <Item>
          <UPImage radius="12" src={SRC} width="100%" height="80px" />
        </Item>
      </Section>

      <Section title="图片模式(widthFix)">
        <Item>
          <UPImage src={SRC} width="80px" height="80px" mode="widthFix" />
        </Item>
      </Section>

      <Section title="图片模式(heightFix)">
        <Item>
          <UPImage src={SRC} width="80px" height="80px" mode="heightFix" />
        </Item>
      </Section>

      <Section title="图片模式(scaleToFill)">
        <Item>
          <UPImage src={SRC} width="80px" height="80px" mode="scaleToFill" />
        </Item>
      </Section>

      <Section title="图片模式(aspectFit)">
        <Item>
          <UPImage src={SRC} width="80px" height="80px" mode="aspectFit" />
        </Item>
      </Section>

      <Section title="图片模式(aspectFill)">
        <Item>
          <UPImage src={SRC} width="80px" height="80px" mode="aspectFill" />
        </Item>
      </Section>

      <Section title="自定义图片加载插槽">
        <Item>
          <UPImage
            src={src1}
            width="80px"
            height="80px"
            mode="widthFix"
            loading={<UPLoadingIcon color="red" />}
          />
        </Item>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  item: { marginBottom: 10 },
});
