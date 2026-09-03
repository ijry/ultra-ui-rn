import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { parseMarkdown, type BlockNode, type InlineNode } from './parser';

export type UPMarkdownProps = {
  content?: string;
  previewImg?: boolean;
  copyLink?: boolean | string;
  domain?: string;
  showLineNumber?: boolean;
  theme?: 'light' | 'dark';
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Source `load` event: fires after content parses successfully. */
  onLoad?: (event: { content: string }) => void;
  /** Source `ready` event: fires when the markdown is rendered. */
  onReady?: () => void;
  /** Source `imgtap` event: fires when an image is tapped. */
  onImgtap?: (event: { src: string; alt?: string }) => void;
  /** Source `linktap` event: fires when a link is tapped. */
  onLinktap?: (event: { href: string }) => void;
  /** @deprecated Source `play` event (audio/video) is a React Native boundary. */
  onPlay?: () => void;
  /** Source `error` event: fires on parse failure. */
  onError?: (event: { message: string }) => void;
};

function Inline({ nodes, theme, onImgtap, onLinktap }: {
  nodes: InlineNode[];
  theme: 'light' | 'dark';
  onImgtap?: (event: { src: string; alt?: string }) => void;
  onLinktap?: (event: { href: string }) => void;
}): React.JSX.Element {
  const textColor = theme === 'dark' ? '#dcdcdc' : '#303133';
  const mutedColor = theme === 'dark' ? '#8a8a8a' : '#909399';
  return (
    <>
      {nodes.map((node, index) => {
        const key = `${node.type}-${index}`;
        switch (node.type) {
          case 'text':
            return (
              <Text key={key} style={{ color: textColor }}>
                {node.text}
              </Text>
            );
          case 'bold':
            return (
              <Text key={key} style={{ color: textColor, fontWeight: '700' }}>
                <Inline nodes={node.children} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
              </Text>
            );
          case 'italic':
            return (
              <Text key={key} style={{ color: textColor, fontStyle: 'italic' }}>
                <Inline nodes={node.children} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
              </Text>
            );
          case 'code':
            return (
              <Text key={key} style={{ backgroundColor: theme === 'dark' ? '#3a3a3a' : '#f2f3f5', borderRadius: 3, color: theme === 'dark' ? '#e06c75' : '#476582', fontFamily: 'monospace', fontSize: 13, paddingHorizontal: 3 }}>
                {node.text}
              </Text>
            );
          case 'link':
            return (
              <Text key={key} style={{ color: '#4da6ff' }}>
                <Pressable
                  onPress={() => onLinktap?.({ href: node.href })}
                  testID={`up-markdown-link-${index}`}
                >
                  <Inline nodes={node.children} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
                </Pressable>
              </Text>
            );
          case 'image':
            return (
              <Text key={key} style={{ color: mutedColor, fontSize: 13 }}>
                <Pressable onPress={() => onImgtap?.({ src: node.src, alt: node.alt })} testID={`up-markdown-image-${index}`}>
                  [图片:{node.alt || node.src}]
                </Pressable>
              </Text>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

function Block({ block, theme, index, showLineNumber, onImgtap, onLinktap }: {
  block: BlockNode;
  theme: 'light' | 'dark';
  index: number;
  showLineNumber?: boolean;
  onImgtap?: (event: { src: string; alt?: string }) => void;
  onLinktap?: (event: { href: string }) => void;
}): React.JSX.Element | null {
  const textColor = theme === 'dark' ? '#dcdcdc' : '#303133';
  const mutedColor = theme === 'dark' ? '#8a8a8a' : '#606266';
  switch (block.type) {
    case 'heading':
      return (
        <Text
          style={{
            color: textColor,
            fontSize: block.level === 1 ? 24 : block.level === 2 ? 20 : block.level === 3 ? 17 : 15,
            fontWeight: '700',
            marginBottom: 8,
            marginTop: block.level <= 2 ? 16 : 8,
          }}
          testID={`up-markdown-heading-${block.level}`}
        >
          <Inline nodes={block.children} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
        </Text>
      );
    case 'paragraph':
      return (
        <Text style={{ color: textColor, fontSize: 15, lineHeight: 22, marginBottom: 10 }}>
          <Inline nodes={block.children} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
        </Text>
      );
    case 'quote':
      return (
        <View style={{ borderLeftColor: '#4da6ff', borderLeftWidth: 3, marginBottom: 10, paddingLeft: 10 }}>
          <Text style={{ color: mutedColor, fontSize: 14, fontStyle: 'italic' }}>
            <Inline nodes={block.children} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
          </Text>
        </View>
      );
    case 'list':
      return (
        <View style={{ marginBottom: 10, paddingLeft: 8 }}>
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: mutedColor, fontSize: 15, marginRight: 6, width: 18 }}>
                {block.ordered ? `${itemIndex + 1}.` : '•'}
              </Text>
              <Text style={{ color: textColor, fontSize: 15, flex: 1 }}>
                <Inline nodes={item} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
              </Text>
            </View>
          ))}
        </View>
      );
    case 'code':
      return (
        <View style={{ backgroundColor: theme === 'dark' ? '#2b2b2b' : '#f6f8fa', borderRadius: 4, marginBottom: 10, padding: 10 }}>
          <Text style={{ color: theme === 'dark' ? '#dcdcdc' : '#24292e', fontFamily: 'monospace', fontSize: 13, lineHeight: 19 }}>
            {showLineNumber ? block.text.split('\n').map((line, i) => `${i + 1}  ${line}`).join('\n') : block.text}
          </Text>
        </View>
      );
    case 'hr':
      return <View key={index} style={{ backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e4e7ed', height: 1, marginBottom: 10, marginTop: 4 }} />;
    case 'table':
      return (
        <View style={{ borderColor: theme === 'dark' ? '#3a3a3a' : '#e4e7ed', borderWidth: 1, marginBottom: 10 }}>
          {block.rows.map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: 'row' }}>
              {row.map((cell, cellIndex) => (
                <View key={cellIndex} style={{ borderLeftWidth: cellIndex === 0 ? 0 : 1, borderColor: theme === 'dark' ? '#3a3a3a' : '#e4e7ed', flex: 1, padding: 6 }}>
                  <Text style={{ color: textColor, fontSize: 13 }}>
                    <Inline nodes={cell} theme={theme} onImgtap={onImgtap} onLinktap={onLinktap} />
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    default:
      return null;
  }
}

export function UPMarkdown(input: UPMarkdownProps): React.JSX.Element {
  const props = { ...useUPConfig().props.markdown, ...input } as UPMarkdownProps;
  const theme = props.theme ?? 'light';
  const background = theme === 'dark' ? '#1e1e1e' : '#ffffff';

  const blocks = useMemo(() => {
    try {
      return parseMarkdown(props.content ?? '');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      input.onError?.({ message });
      return [] as BlockNode[];
    }
  }, [props.content]);

  useEffect(() => {
    input.onLoad?.({ content: props.content ?? '' });
    input.onReady?.();
  }, [blocks]);

  return (
    <ScrollView style={[{ backgroundColor: background }, input.customStyle]} testID="up-markdown">
      {blocks.map((block, index) => (
        <Block
          block={block}
          index={index}
          key={`${block.type}-${index}`}
          onImgtap={input.onImgtap}
          onLinktap={input.onLinktap}
          showLineNumber={props.showLineNumber}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
}
