/**
 * UPNovelReader 组件示例 — 小说阅读器
 * 展示：基础阅读、滚动/翻页模式、设置
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { UPNovelReader } from 'ultra-ui-rn';
import { DemoPage, Section, Row, Value, PropsTable, type DemoProps } from '../_shared';

const CHAPTERS = [
  { title: '第一章 开始', content: '这是第一章的内容。故事从这里开始，主角踏上了未知的旅程。前方的道路充满了挑战，但他已经做好了准备。' },
  { title: '第二章 冒险', content: '第二章讲述了主角的冒险经历。他遇到了各种困难，但都一一克服了。在这个过程中，他也结识了许多志同道合的伙伴。' },
  { title: '第三章 成长', content: '经过一系列的考验，主角逐渐成长起来。他学会了如何面对困境，如何做出正确的选择。' },
];

const PROPS = [
  { prop: 'chapters', type: 'NovelChapter[]', default: '[]', desc: '章节列表' },
  { prop: 'currentChapter', type: 'NovelChapter', default: '—', desc: '当前章节' },
  { prop: 'mode', type: "'scroll' | 'page'", default: "'scroll'", desc: '阅读模式' },
  { prop: 'loading', type: 'boolean', default: 'false', desc: '加载状态' },
  { prop: 'showBack', type: 'boolean', default: 'true', desc: '显示返回按钮' },
];

export default function NovelReaderDemo({ onBack }: DemoProps) {
  const [chapter, setChapter] = useState(CHAPTERS[0]);

  return (
    <DemoPage title="NovelReader 小说阅读器" onBack={onBack}>
      <Section title="滚动模式">
        <UPNovelReader
          chapters={CHAPTERS}
          currentChapter={chapter}
          mode="scroll"
          showBack
        />
      </Section>

      <Row>
        {CHAPTERS.map((ch, i) => (
          <View key={i} style={{ flex: 1, padding: 8, backgroundColor: chapter.title === ch.title ? '#3c9cff' : '#e0e0e0', borderRadius: 4, margin: 2, alignItems: 'center' }}>
            <Text style={{ color: chapter.title === ch.title ? '#fff' : '#333', fontSize: 12 }} onPress={() => setChapter(ch)}>
              第{i + 1}章
            </Text>
          </View>
        ))}
      </Row>

      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
