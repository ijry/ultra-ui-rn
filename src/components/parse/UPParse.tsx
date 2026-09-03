import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { parseHtml, type ParseNode } from './htmlParser';

export type UPParseNode = ParseNode;

export type UPParseClickDetail = {
  tag: string;
  attrs: Record<string, string>;
  text: string;
};

export type UPParseProps = {
  content?: string;
  /** @deprecated CSS string syntax unsupported in RN. Use customStyle instead. */
  containerStyle?: string;
  copyLink?: boolean | string;
  domain?: string;
  errorImg?: string;
  lazyLoad?: boolean;
  loadingImg?: string;
  pauseVideo?: boolean;
  previewImg?: boolean;
  scrollTable?: boolean;
  selectable?: boolean;
  setTitle?: boolean;
  showImgMenu?: boolean;
  tagStyle?: Record<string, unknown>;
  useAnchor?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Source `click` event: fires when an element is tapped (payload carries node detail). */
  onClick?: (event: UPParseClickDetail) => void;
  /** Source `tap` event alias (same timing as `onClick`). */
  onTap?: (event: UPParseClickDetail) => void;
  /** Source `load` event: fires after content parses successfully. */
  onLoad?: (event: { content: string }) => void;
  /** Source `ready` event: fires when the content is rendered. */
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

function nodeText(node: ParseNode): string {
  if (node.type === 'text') return node.text;
  return node.children.map(nodeText).join('');
}

function ImageRenderer({ src, alt, domain, errorImg, loadingImg, onPress }: {
  src: string;
  alt?: string;
  domain?: string;
  errorImg?: string;
  loadingImg?: string;
  onPress?: () => void;
}): React.JSX.Element {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Resolve relative URLs with domain
  const resolvedSrc = useMemo(() => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    if (domain) {
      const base = domain.endsWith('/') ? domain.slice(0, -1) : domain;
      const path = src.startsWith('/') ? src : `/${src}`;
      return base + path;
    }
    return src;
  }, [src, domain]);

  useEffect(() => {
    if (!resolvedSrc) {
      setStatus('error');
      return;
    }

    Image.getSize(
      resolvedSrc,
      (width, height) => {
        setDimensions({ width, height });
        setStatus('success');
      },
      () => {
        setStatus('error');
      }
    );
  }, [resolvedSrc]);

  if (status === 'loading') {
    if (loadingImg) {
      return (
        <View testID="up-parse-node-img">
          <Image
            source={{ uri: loadingImg }}
            style={{ width: 100, height: 100, marginVertical: 4 }}
            testID="up-parse-img-loading"
          />
        </View>
      );
    }
    return (
      <View testID="up-parse-node-img">
        <Text style={{ color: '#909399', fontSize: 13, marginVertical: 4 }}>
          [加载中...]
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    if (errorImg) {
      return (
        <View testID="up-parse-node-img">
          <Image
            source={{ uri: errorImg }}
            style={{ width: 100, height: 100, marginVertical: 4 }}
            testID="up-parse-img-error"
          />
        </View>
      );
    }
    return (
      <View testID="up-parse-node-img">
        <Text style={{ color: '#909399', fontSize: 13, marginVertical: 4 }}>
          [图片加载失败: {alt || src}]
        </Text>
      </View>
    );
  }

  // Calculate display dimensions (max width 90% of container, maintain aspect ratio)
  const maxWidth = 340; // Approximate 90% of typical phone width
  let displayWidth = dimensions?.width || 100;
  let displayHeight = dimensions?.height || 100;

  if (displayWidth > maxWidth) {
    const ratio = maxWidth / displayWidth;
    displayWidth = maxWidth;
    displayHeight = displayHeight * ratio;
  }

  return (
    <Pressable onPress={onPress} testID="up-parse-node-img">
      <Image
        source={{ uri: resolvedSrc }}
        style={{ width: displayWidth, height: displayHeight, marginVertical: 4 }}
        resizeMode="contain"
        testID="up-parse-img"
      />
    </Pressable>
  );
}

function RenderNode({ node, onPress, textColor, mutedColor, domain, errorImg, loadingImg }: {
  node: ParseNode;
  onPress?: (detail: UPParseClickDetail) => void;
  textColor: string;
  mutedColor: string;
  domain?: string;
  errorImg?: string;
  loadingImg?: string;
}): React.JSX.Element | null {
  if (node.type === 'text') {
    return (
      <Text style={{ color: textColor, fontSize: 15, lineHeight: 22 }}>{node.text}</Text>
    );
  }

  const { tag, attrs, children } = node;
  const style: Record<string, unknown> = { color: textColor, fontSize: 15, lineHeight: 22 };

  const wrap = (inner: React.ReactNode): React.JSX.Element => (
    <Pressable
      onPress={() =>
        onPress?.({
          tag,
          attrs,
          text: nodeText(node),
        })
      }
      testID={`up-parse-node-${tag}`}
    >
      {inner}
    </Pressable>
  );

  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const size = { h1: 24, h2: 20, h3: 17, h4: 15, h5: 14, h6: 13 }[tag];
      return wrap(
        <Text style={{ color: textColor, fontSize: size, fontWeight: '700', marginBottom: 6, marginTop: 10 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    }
    case 'p':
    case 'div':
    case 'span':
      return wrap(
        <Text style={style}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'br':
      return wrap(<Text style={style}>{'\n'}</Text>);
    case 'strong':
    case 'b':
      return wrap(
        <Text style={{ color: textColor, fontSize: 15, fontWeight: '700' }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'em':
    case 'i':
      return wrap(
        <Text style={{ color: textColor, fontSize: 15, fontStyle: 'italic' }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'u':
      return wrap(
        <Text style={{ color: textColor, fontSize: 15, textDecorationLine: 'underline' }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'del':
      return wrap(
        <Text style={{ color: mutedColor, fontSize: 15, textDecorationLine: 'line-through' }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 's':
      return wrap(
        <Text style={{ color: mutedColor, fontSize: 15, textDecorationLine: 'line-through' }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'sup':
      return wrap(
        <Text style={{ color: textColor, fontSize: 11, lineHeight: 15 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'sub':
      return wrap(
        <Text style={{ color: textColor, fontSize: 11, lineHeight: 15 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'small':
      return wrap(
        <Text style={{ color: textColor, fontSize: 13 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'big':
      return wrap(
        <Text style={{ color: textColor, fontSize: 17 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'ruby':
    case 'section':
      return wrap(
        <View>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </View>,
      );
    case 'rp':
    case 'rt':
      return wrap(
        <Text style={{ color: mutedColor, fontSize: 11 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'code':
      return wrap(
        <Text style={{ backgroundColor: '#f2f3f5', borderRadius: 3, color: '#476582', fontFamily: 'monospace', fontSize: 13, paddingHorizontal: 3 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </Text>,
      );
    case 'pre':
      return wrap(
        <View style={{ backgroundColor: '#f6f8fa', borderRadius: 4, marginBottom: 8, padding: 10 }}>
          <Text style={{ color: '#24292e', fontFamily: 'monospace', fontSize: 13, lineHeight: 19 }}>
            {children.map((child, index) => (
              <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
            ))}
          </Text>
        </View>,
      );
    case 'blockquote':
      return wrap(
        <View style={{ borderLeftColor: '#4da6ff', borderLeftWidth: 3, marginBottom: 8, paddingLeft: 10 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={mutedColor} />
          ))}
        </View>,
      );
    case 'ul':
    case 'ol':
      return wrap(
        <View style={{ marginBottom: 8, paddingLeft: 12 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </View>,
      );
    case 'li':
      return wrap(
        <View style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={{ color: mutedColor, fontSize: 15, marginRight: 6, width: 16 }}>•</Text>
          <View style={{ flex: 1 }}>
            {children.map((child, childIndex) => (
              <RenderNode key={childIndex} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
            ))}
          </View>
        </View>,
      );
    case 'a':
      return wrap(
        <Pressable onPress={() => onPress?.({ tag, attrs, text: nodeText(node) })}>
          <Text style={{ color: '#4da6ff', fontSize: 15, textDecorationLine: 'underline' }}>
            {children.map((child, index) => (
              <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
            ))}
          </Text>
        </Pressable>,
      );
    case 'img':
      return (
        <ImageRenderer
          alt={attrs.alt}
          domain={domain}
          errorImg={errorImg}
          loadingImg={loadingImg}
          onPress={() => onPress?.({ tag, attrs, text: nodeText(node) })}
          src={attrs.src || ''}
        />
      );
    case 'table':
      return wrap(
        <View style={{ borderColor: '#e4e7ed', borderWidth: 1, marginBottom: 8 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </View>,
      );
    case 'tr':
      return wrap(
        <View style={{ flexDirection: 'row' }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </View>,
      );
    case 'td':
    case 'th':
      return wrap(
        <View style={{ borderColor: '#e4e7ed', borderWidth: 0.5, flex: 1, padding: 6 }}>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </View>,
      );
    default:
      return (
        <>
          {children.map((child, index) => (
            <RenderNode key={index} domain={domain} errorImg={errorImg} loadingImg={loadingImg} mutedColor={mutedColor} node={child} onPress={onPress} textColor={textColor} />
          ))}
        </>
      );
  }
}

export function UPParse(input: UPParseProps): React.JSX.Element {
  const props = { ...useUPConfig().props.parse, ...input } as UPParseProps;
  const textColor = '#303133';
  const mutedColor = '#909399';

  const nodes = useMemo(() => {
    try {
      return parseHtml(props.content ?? '');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      input.onError?.({ message });
      return [] as ParseNode[];
    }
  }, [props.content]);

  useEffect(() => {
    input.onLoad?.({ content: props.content ?? '' });
    input.onReady?.();
  }, [nodes]);

  const press = (detail: UPParseClickDetail) => {
    input.onClick?.(detail);
    input.onTap?.(detail);
    if (detail.tag === 'a' && detail.attrs.href) input.onLinktap?.({ href: detail.attrs.href });
    if (detail.tag === 'img' && detail.attrs.src) input.onImgtap?.({ src: detail.attrs.src, alt: detail.attrs.alt });
  };

  return (
    <ScrollView style={input.customStyle} testID="up-parse">
      {nodes.map((node, index) => (
        <RenderNode key={index} domain={props.domain} errorImg={props.errorImg} loadingImg={props.loadingImg} mutedColor={mutedColor} node={node} onPress={press} textColor={textColor} />
      ))}
    </ScrollView>
  );
}
