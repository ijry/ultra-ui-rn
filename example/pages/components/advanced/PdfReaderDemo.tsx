/**
 * PdfReader PDF阅读器
 * 严格复刻 uview-plus pages/componentsD/pdfReader/pdfReader.nvue
 */
import React, { useState } from 'react';
import { UPButton, UPPdfReader, UPPopup } from 'ultra-ui-rn';
import { DemoPage, PageItem, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'src', type: 'string', default: "''", desc: 'PDF 文件地址' },
  { prop: 'height', type: 'string', default: "'500px'", desc: '阅读器高度' },
  {
    prop: 'baseUrl',
    type: 'string',
    default: "'https://uview-plus.jiangruyi.com/h5'",
    desc: 'H5 版 pdf.js 基址（RN 侧未使用）',
  },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '根节点样式' },
  {
    prop: 'renderPdf',
    type: '(payload: { src, height }) => ReactNode',
    default: '—',
    desc: 'RN 原生接缝：注入 react-native-pdf / WebView 渲染',
  },
];

const PDF_FILE_URL = 'https://uview-plus.jiangruyi.com/big/plus.pdf';

export default function PdfReaderDemo() {
  const [show, setShow] = useState(false);

  return (
    <DemoPage>
      <PageItem title="默认">
        <UPButton onClick={() => setShow(true)}>打开PDF预览</UPButton>
        {/*
          源库靠 uni-app 的 web-view 加载 pdf.js。本地 UPPdfReader 把渲染做成了
          renderPdf 接缝（react-native-pdf / WebView），未注入时渲染自带占位块；
          baseUrl 只保留在 props 上，RN 侧不参与渲染。
        */}
        <UPPopup onChangeShow={setShow} show={show}>
          <UPPdfReader baseUrl="" src={PDF_FILE_URL} />
        </UPPopup>
      </PageItem>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
