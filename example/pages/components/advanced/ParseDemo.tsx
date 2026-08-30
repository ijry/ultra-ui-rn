/**
 * UPParse 组件示例 — 富文本解析
 * 展示：HTML解析、图片预览
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPParse } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const HTML_CONTENT = `
<h2>富文本标题</h2>
<p>这是一段 <strong>富文本</strong> 内容，支持 <em>HTML 标签</em> 解析。</p>
<ul>
  <li>列表项 1</li>
  <li>列表项 2</li>
  <li>列表项 3</li>
</ul>
<blockquote>这是一段引用文字</blockquote>
`;

const PROPS = [
  { prop: 'content', type: 'string', default: '""', desc: 'HTML内容' },
  { prop: 'lazyLoad', type: 'boolean', default: 'false', desc: '图片懒加载' },
  { prop: 'previewImg', type: 'boolean', default: 'true', desc: '图片预览' },
  { prop: 'selectable', type: 'boolean', default: 'false', desc: '文字可选' },
  { prop: 'setTitle', type: 'boolean', default: 'false', desc: '自动设置页面标题' },
];

export default function ParseDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Parse 富文本解析" onBack={onBack}>
      <Section title="基础 HTML 解析">
        <UPParse content={HTML_CONTENT} />
      </Section>

      <Section title="可选文字">
        <UPParse content={HTML_CONTENT} selectable />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
