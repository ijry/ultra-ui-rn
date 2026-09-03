/**
 * Markdown 渲染
 * 严格复刻 uview-plus pages/componentsD/markdown/markdown.nvue
 */
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPButton, UPMarkdown } from 'ultra-ui-rn';
import { DemoPage, PageItem } from '../_shared';

const basicContent = `# 标题1
这是段落文本，包含**粗体**和*斜体*文本。

## 标题2
这是一个链接：[uview-plus](https://ijry.github.io/uview-plus)

### 列表示例
- 列表项1
- 列表项2
- 列表项3

> 这是一个引用块

---

段落中的行内代码： \`console.log('Hello World')\``;

const codeContent = `# 代码示例

以下是一个JavaScript函数：

\`\`\`javascript
function hello(name) {
    console.log('Hello, ' + name + '!');
}

hello('World');
\`\`\`

以下是一个Python示例：

\`\`\`python
def hello(name):
    print(f"Hello, {name}!")

hello("World")
\`\`\``;

const fullAIContent = `# AI助手回答

你好！我是AI助手，正在为你逐步生成回答内容...

## 问题分析

让我来分析你提出的问题：

1. 需要实现流式内容显示
2. 模拟AI逐步输出文字的效果
3. 使用定时器控制内容显示速度

## 解决方案

我们可以使用以下方法实现：

### 第一步：创建数据模型
\`\`\`javascript
data() {
  return {
    streamingContent: '',
    isStreaming: false,
    streamTimer: null
  }
}
\`\`\`

### 第二步：实现流式显示逻辑
\`\`\`javascript
methods: {
  startStreaming() {
    // 实现流式显示逻辑
  }
}
\`\`\`

## 总结

以上就是实现流式内容显示的基本方法。通过定时器控制内容逐字显示，可以营造出AI正在思考和逐步输出的效果。

这种交互方式在现代Web应用中非常常见，特别是在AI助手类产品中。

---

*内容生成完毕*`;

export default function MarkdownDemo() {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIndexRef = useRef(0);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startStreaming = () => {
    if (isStreaming) return;
    if (streamIndexRef.current >= fullAIContent.length) {
      streamIndexRef.current = 0;
      setStreamingContent('');
    }
    setIsStreaming(true);
    streamTimerRef.current = setInterval(() => {
      if (streamIndexRef.current < fullAIContent.length) {
        setStreamingContent((prev) => prev + fullAIContent[streamIndexRef.current]);
        streamIndexRef.current += 1;
      } else {
        stopStreaming();
      }
    }, 50);
  };

  const stopStreaming = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
  };

  const resetStreaming = () => {
    stopStreaming();
    setStreamingContent('');
    streamIndexRef.current = 0;
  };

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  return (
    <DemoPage>
      <PageItem title="基础用法">
        <UPMarkdown content={basicContent} />
      </PageItem>

      <PageItem title="带代码块行号">
        {/* showLineNumber is not implemented in local component */}
        <UPMarkdown content={codeContent} showLineNumber />
      </PageItem>

      <PageItem title="深色主题">
        <UPMarkdown content={basicContent} theme="dark" />
      </PageItem>

      <PageItem title="AI流式内容显示">
        <UPMarkdown content={streamingContent} showLineNumber />
        <View style={s.buttonRow}>
          <UPButton
            customStyle={s.button}
            onClick={isStreaming ? stopStreaming : startStreaming}
            size="mini"
            text={isStreaming ? '停止' : '开始'}
            type="primary"
          />
          {/* upstream type="default"; UPButtonType has no 'default', 'info' is the white default style */}
          <UPButton onClick={resetStreaming} size="mini" text="重置" type="info" />
        </View>
      </PageItem>
    </DemoPage>
  );
}

const s = StyleSheet.create({
  button: { marginRight: 10 },
  buttonRow: { flexDirection: 'row', marginTop: 10 },
});
