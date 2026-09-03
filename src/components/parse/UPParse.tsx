import React, { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { parseHtml, type ParseNode } from './htmlParser';

export type UPParseNode = ParseNode;

export type UPParseRef = {
  /** Source instance method: scrolls to the element with `id`, plus an extra offset. */
  navigateTo: (id?: string, offset?: number) => Promise<void>;
};

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
  /** Source accepts a number here too, used as the default `navigateTo` offset. */
  useAnchor?: boolean | number;
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

function resolveUrl(url: string, domain?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('#')) {
    return url;
  }
  if (domain) {
    const base = domain.endsWith('/') ? domain.slice(0, -1) : domain;
    const path = url.startsWith('/') ? url : `/${url}`;
    return base + path;
  }
  return url;
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
  const resolvedSrc = useMemo(() => resolveUrl(src, domain), [src, domain]);

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

type ParseRenderOptions = {
  onPress?: (detail: UPParseClickDetail) => void;
  textColor: string;
  mutedColor: string;
  domain?: string;
  errorImg?: string;
  loadingImg?: string;
  scrollTable?: boolean;
  /** Set when `useAnchor` is on: records each `id`-bearing node's offset in the scroll content. */
  registerAnchor?: (id: string, y: number) => void;
  /** The ScrollView content view that anchor offsets are measured against. */
  contentRef?: React.RefObject<View | null>;
};

const ParseContext = createContext<ParseRenderOptions>({
  mutedColor: '#909399',
  textColor: '#303133',
});

function RenderNode({ node }: { node: ParseNode }): React.JSX.Element | null {
  const options = useContext(ParseContext);
  const { onPress, textColor, mutedColor, domain, errorImg, loadingImg, scrollTable, registerAnchor, contentRef } =
    options;
  const anchorRef = useRef<View | null>(null);
  if (node.type === 'text') {
    return (
      <Text style={{ color: textColor, fontSize: 15, lineHeight: 22 }}>{node.text}</Text>
    );
  }

  const { tag, attrs, children } = node;
  const style: Record<string, unknown> = { color: textColor, fontSize: 15, lineHeight: 22 };

  // `useAnchor` support: measure this node's offset inside the scroll content so
  // `navigateTo(id)` can scroll to it. Source resolves anchors through
  // `createSelectorQuery`, which has no RN equivalent (u-parse.vue:184-195).
  const anchorId = registerAnchor && attrs.id ? attrs.id : undefined;
  const measureAnchor = () => {
    const target = anchorRef.current;
    const container = contentRef?.current;
    if (!anchorId || !registerAnchor || !target || !container) return;
    target.measureLayout(
      container,
      (_x, y) => registerAnchor(anchorId, y),
      () => undefined,
    );
  };

  const wrap = (inner: React.ReactNode): React.JSX.Element => {
    const pressable = (
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
    if (!anchorId) return pressable;
    return (
      <View collapsable={false} onLayout={measureAnchor} ref={anchorRef} testID={`up-parse-anchor-${anchorId}`}>
        {pressable}
      </View>
    );
  };

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
            <RenderNode key={index} node={child} />
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
            <RenderNode key={index} node={child} />
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
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'em':
    case 'i':
      return wrap(
        <Text style={{ color: textColor, fontSize: 15, fontStyle: 'italic' }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'u':
      return wrap(
        <Text style={{ color: textColor, fontSize: 15, textDecorationLine: 'underline' }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'del':
      return wrap(
        <Text style={{ color: mutedColor, fontSize: 15, textDecorationLine: 'line-through' }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 's':
      return wrap(
        <Text style={{ color: mutedColor, fontSize: 15, textDecorationLine: 'line-through' }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'sup':
      return wrap(
        <Text style={{ color: textColor, fontSize: 11, lineHeight: 15 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'sub':
      return wrap(
        <Text style={{ color: textColor, fontSize: 11, lineHeight: 15 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'small':
      return wrap(
        <Text style={{ color: textColor, fontSize: 13 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'big':
      return wrap(
        <Text style={{ color: textColor, fontSize: 17 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'ruby':
    case 'section':
      return wrap(
        <View>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </View>,
      );
    case 'rp':
    case 'rt':
      return wrap(
        <Text style={{ color: mutedColor, fontSize: 11 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'code':
      return wrap(
        <Text style={{ backgroundColor: '#f2f3f5', borderRadius: 3, color: '#476582', fontFamily: 'monospace', fontSize: 13, paddingHorizontal: 3 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </Text>,
      );
    case 'pre':
      return wrap(
        <View style={{ backgroundColor: '#f6f8fa', borderRadius: 4, marginBottom: 8, padding: 10 }}>
          <Text style={{ color: '#24292e', fontFamily: 'monospace', fontSize: 13, lineHeight: 19 }}>
            {children.map((child, index) => (
              <RenderNode key={index} node={child} />
            ))}
          </Text>
        </View>,
      );
    case 'blockquote':
      return wrap(
        <View style={{ borderLeftColor: '#4da6ff', borderLeftWidth: 3, marginBottom: 8, paddingLeft: 10 }}>
          {/* Source renders quoted text muted; override the inherited text color. */}
          <ParseContext.Provider value={{ ...options, textColor: mutedColor }}>
            {children.map((child, index) => (
              <RenderNode key={index} node={child} />
            ))}
          </ParseContext.Provider>
        </View>,
      );
    case 'ul':
    case 'ol':
      return wrap(
        <View style={{ marginBottom: 8, paddingLeft: 12 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </View>,
      );
    case 'li':
      return wrap(
        <View style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={{ color: mutedColor, fontSize: 15, marginRight: 6, width: 16 }}>•</Text>
          <View style={{ flex: 1 }}>
            {children.map((child, childIndex) => (
              <RenderNode key={childIndex} node={child} />
            ))}
          </View>
        </View>,
      );
    case 'a':
      return wrap(
        <Pressable onPress={() => onPress?.({ tag, attrs, text: nodeText(node) })}>
          <Text style={{ color: '#4da6ff', fontSize: 15, textDecorationLine: 'underline' }}>
            {children.map((child, index) => (
              <RenderNode key={index} node={child} />
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
    case 'table': {
      const table = (
        <View style={{ borderColor: '#e4e7ed', borderWidth: 1, marginBottom: 8 }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </View>
      );
      // Source wraps wide tables in an `overflow:auto` div (parser.js). RN has no
      // auto table layout, so cells switch from `flex: 1` to a fixed minWidth and
      // the table is placed in a horizontal ScrollView.
      if (!scrollTable) return wrap(table);
      return wrap(
        <ScrollView horizontal showsHorizontalScrollIndicator testID="up-parse-table-scroll">
          {table}
        </ScrollView>,
      );
    }
    case 'tr':
      return wrap(
        <View style={{ flexDirection: 'row' }}>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </View>,
      );
    case 'td':
    case 'th':
      return wrap(
        <View
          style={{
            borderColor: '#e4e7ed',
            borderWidth: 0.5,
            flex: scrollTable ? undefined : 1,
            minWidth: scrollTable ? 100 : undefined,
            padding: 6,
          }}
          testID="up-parse-cell"
        >
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </View>,
      );
    default:
      return (
        <>
          {children.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </>
      );
  }
}

export const UPParse = forwardRef<UPParseRef, UPParseProps>(function UPParse(input, ref) {
  const props = { ...useUPConfig().props.parse, ...input } as UPParseProps;
  const textColor = '#303133';
  const mutedColor = '#909399';
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View | null>(null);
  const anchorsRef = useRef<Record<string, number>>({});

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
    anchorsRef.current = {};
  }, [nodes]);

  useEffect(() => {
    input.onLoad?.({ content: props.content ?? '' });
    input.onReady?.();
  }, [nodes]);

  const press = (detail: UPParseClickDetail) => {
    input.onClick?.(detail);
    input.onTap?.(detail);
    if (detail.tag === 'a' && detail.attrs.href) {
      const resolvedHref = resolveUrl(detail.attrs.href, props.domain);
      input.onLinktap?.({ href: resolvedHref });
      // Source scrolls to in-page anchors itself when `useAnchor` is on.
      if (props.useAnchor && resolvedHref.startsWith('#')) {
        void navigateTo(resolvedHref.slice(1)).catch(() => undefined);
      }
    }
    if (detail.tag === 'img' && detail.attrs.src) {
      const resolvedSrc = resolveUrl(detail.attrs.src, props.domain);
      input.onImgtap?.({ src: resolvedSrc, alt: detail.attrs.alt });
    }
  };

  const registerAnchor = useCallback((id: string, y: number) => {
    anchorsRef.current[id] = y;
  }, []);

  /** Source `navigateTo(id, offset)` (u-parse.vue:157). Rejects when anchors are off or unknown. */
  const navigateTo = useCallback(
    (id?: string, offset?: number) =>
      new Promise<void>((resolve, reject) => {
        if (!props.useAnchor) {
          reject(new Error('Anchor is disabled'));
          return;
        }
        const extra = offset ?? (typeof props.useAnchor === 'number' ? props.useAnchor : 0);
        if (!id) {
          scrollRef.current?.scrollTo({ animated: true, y: extra });
          resolve();
          return;
        }
        const y = anchorsRef.current[id];
        if (y === undefined) {
          reject(new Error(`Anchor "${id}" not found`));
          return;
        }
        scrollRef.current?.scrollTo({ animated: true, y: y + extra });
        resolve();
      }),
    [props.useAnchor],
  );

  useImperativeHandle(ref, () => ({ navigateTo }), [navigateTo]);

  const options = useMemo<ParseRenderOptions>(
    () => ({
      contentRef,
      domain: props.domain,
      errorImg: props.errorImg,
      loadingImg: props.loadingImg,
      mutedColor,
      onPress: press,
      registerAnchor: props.useAnchor ? registerAnchor : undefined,
      scrollTable: props.scrollTable,
      textColor,
    }),
    // `press` is recreated per render by design; the rest are the real inputs.
    [props.domain, props.errorImg, props.loadingImg, props.scrollTable, props.useAnchor, registerAnchor],
  );

  return (
    <ScrollView ref={scrollRef} style={input.customStyle} testID="up-parse">
      <View collapsable={false} ref={contentRef}>
        <ParseContext.Provider value={options}>
          {nodes.map((node, index) => (
            <RenderNode key={index} node={node} />
          ))}
        </ParseContext.Provider>
      </View>
    </ScrollView>
  );
});
