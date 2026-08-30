/**
 * UPMarkdown 组件示例 — Markdown渲染
 * 展示：基础Markdown、代码高亮、深色模式
 */
import React from 'react';
import { View, Text } from 'react-native';
import { UPMarkdown } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, type DemoProps } from '../_shared';

const CONTENT = `# 标题一

这是一段 **加粗文字** 和 *斜体文字*。

## 列表
- 项目一
- 项目二
- 项目三

## 代码
\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> 引用文字

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |
`;

const PROPS = [
  { prop: 'content', type: 'string', default: '""', desc: 'Markdown内容' },
  { prop: 'theme', type: "'light' | 'dark'", default: "'light'", desc: '主题' },
  { prop: 'previewImg', type: 'boolean', default: 'true', desc: '是否预览图片' },
  { prop: 'showLineNumber', type: 'boolean', default: 'false', desc: '显示行号' },
  { prop: 'onLoad', type: '(event) => void', default: '—', desc: '加载完成回调' },
  { prop: 'onReady', type: '() => void', default: '—', desc: '渲染完成回调' },
];

export default function MarkdownDemo({ onBack }: DemoProps) {
  return (
    <DemoPage title="Markdown 渲染" onBack={onBack}>
      <Section title="基础 Markdown">
        <UPMarkdown content={CONTENT} />
      </Section>

      <Section title="深色模式">
        <View style={{ backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8 }}>
          <UPMarkdown content={CONTENT} theme="dark" />
        </View>
      </Section>

      <Section title="显示行号">
        <UPMarkdown content={CONTENT} showLineNumber />
      </Section>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
