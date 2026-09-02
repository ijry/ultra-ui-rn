/**
 * Box 盒子布局
 * 严格复刻 uview-plus pages/componentsD/box/box.nvue
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UPBox, UPGap, UPIcon } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'bgColors', type: 'string[]', default: '—', desc: '三个区块的背景色' },
  { prop: 'height', type: 'number | string', default: '—', desc: '整体高度' },
  { prop: 'borderRadius', type: 'number | string', default: '—', desc: '区块圆角' },
  { prop: 'gap', type: 'number | string', default: '—', desc: '区块之间的间距' },
  { prop: 'leftTitle', type: 'string', default: '—', desc: '左侧区块标题' },
  { prop: 'rightTopTitle', type: 'string', default: '—', desc: '右上区块标题' },
  { prop: 'rightBottomTitle', type: 'string', default: '—', desc: '右下区块标题' },
  { prop: 'left', type: 'ReactNode', default: '—', desc: '左侧自定义内容（源 left 插槽）' },
  { prop: 'rightTop', type: 'ReactNode', default: '—', desc: '右上自定义内容（源 rightTop 插槽）' },
  { prop: 'rightBottom', type: 'ReactNode', default: '—', desc: '右下自定义内容（源 rightBottom 插槽）' },
];

export default function BoxDemo() {
  return (
    <DemoPage>
      <PageItem title="基础功能">
        <UPBox
          gap="12px"
          height="160px"
          left={<Text>左</Text>}
          rightBottom={<Text>右下</Text>}
          rightTop={<Text>右上</Text>}
        />
      </PageItem>

      <PageItem title="自定义插槽">
        <UPBox
          gap="12px"
          height="180px"
          left={<UPIcon name="arrow-left" size={19} />}
          rightBottom={<UPIcon name="arrow-left" size={19} />}
          rightTop={<UPIcon name="arrow-left" size={19} />}
        />
      </PageItem>

      <UPGap height={50} />

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
