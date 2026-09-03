/**
 * Qrcode 二维码
 * 严格复刻 uview-plus pages/componentsD/qrcode/qrcode.nvue
 */
import React from 'react';
import { UPQrcode } from 'ultra-ui-rn';
import { DemoPage, PageItem } from '../_shared';

const VAL = 'https://click.meituan.com/t?t=1&c=2&p=WhaD2b5zGU-h';

export default function QrcodeDemo() {
  return (
    <DemoPage>
      {/* 上游标题内含 #ifdef APP-NVUE 条件文本（gcanvas渲染 / webview渲染），
          属 uni-app nvue 渲染器差异，React Native 无对应概念，故未复刻。 */}
      <PageItem title="不带logo">
        <UPQrcode cid="up1" size={150} val={VAL} />
      </PageItem>

      <PageItem title="带logo">
        <UPQrcode
          cid="up2"
          icon="https://uview-plus.jiangruyi.com/h5/static/uview/common/logo.png"
          size={150}
          val={VAL}
        />
      </PageItem>

      <PageItem title="二维码颜色">
        <UPQrcode background="red" cid="up3" foreground="blue" size={150} val={VAL} />
      </PageItem>
    </DemoPage>
  );
}
