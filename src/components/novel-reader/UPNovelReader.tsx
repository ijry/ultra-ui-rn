import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPPopup } from '../popup';
import { getUPNovelStorage } from './storage';
import { NOVEL_DEFAULT_SETTINGS, NOVEL_THEME_TOKENS, type NovelBookmark, type NovelChapter, type NovelProgress, type NovelReaderError, type NovelReaderSettings, type NovelThemeName, type NovelThemeTokens } from './types';

export type UPNovelReaderProps = {
  chapters?: readonly NovelChapter[];
  currentChapter?: NovelChapter | null;
  loading?: boolean;
  error?: NovelReaderError | null;
  bookId?: string | number;
  storageKey?: string;
  persist?: boolean;
  initialProgress?: NovelProgress | null;
  progress?: NovelProgress | null;
  initialBookmarks?: readonly NovelBookmark[];
  bookmarks?: readonly NovelBookmark[] | null;
  defaultSettings?: Partial<NovelReaderSettings>;
  settings?: Partial<NovelReaderSettings> | null;
  mode?: 'scroll' | 'page';
  showBack?: boolean;
  autoBack?: boolean;
  backIcon?: string;
  safeAreaInsetTop?: boolean;
  safeAreaInsetBottom?: boolean;
  preloadThreshold?: number;
  pageAnimation?: boolean;
  controlsAutoHide?: number;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /**
   * Source `toolbar-extra` slot: extra controls appended to the top toolbar,
   * after the built-in catalog/settings/bookmark buttons (upstream demo uses it
   * for a scroll/page mode toggle — novelReader.nvue:18-25).
   */
  toolbarExtraNode?: React.ReactNode;
  /** Source `chapter-request` event: fires when a chapter needs loading. */
  onChapterRequest?: (payload: { chapterIndex: number; chapter: NovelChapter }) => void;
  /** Source `chapter-prefetch` event: fires when neighbouring chapters are about to be needed. */
  onChapterPrefetch?: (payload: { chapterIndex: number }) => void;
  /** Source `progress-change` event. */
  onProgressChange?: (progress: NovelProgress) => void;
  /** Source `settings-change` event. */
  onSettingsChange?: (settings: NovelReaderSettings) => void;
  /** Source `bookmark-change` event. */
  onBookmarkChange?: (bookmarks: NovelBookmark[]) => void;
  /** Source `reading-time-change` event. */
  onReadingTimeChange?: (payload: { seconds: number; chapterIndex: number }) => void;
  /** Source `back` event. */
  onBack?: () => void;
  /** Source `mode-change` event. */
  onModeChange?: (mode: 'scroll' | 'page') => void;
  /** Source `toolbar-change` event. */
  onToolbarChange?: (payload: { visible: boolean }) => void;
  /** Source `layout-ready` event. */
  onLayoutReady?: (payload: { chapterIndex: number; paragraphs: number; pages: number }) => void;
  /** Source `retry` event. */
  onRetry?: (payload: { chapterIndex: number }) => void;
};

function paragraphsOf(chapter: NovelChapter | undefined): string[] {
  if (!chapter) return [];
  const content = chapter.content ?? '';
  return content.split('\n').filter((line) => line.trim().length > 0);
}

const HEADER_HEIGHT = 44;
const FOOTER_HEIGHT = 48;

export function UPNovelReader(input: UPNovelReaderProps): React.JSX.Element {
  const props = { ...useUPConfig().props.novelReader, ...input } as UPNovelReaderProps;
  const chapters = props.chapters ?? [];
  const [chapterIndex, setChapterIndex] = useState(() => props.initialProgress?.chapterIndex ?? props.progress?.chapterIndex ?? 0);
  const [settings, setSettings] = useState<NovelReaderSettings>({
    ...NOVEL_DEFAULT_SETTINGS,
    ...props.defaultSettings,
    ...(props.settings ?? {}),
  });
  const [bookmarks, setBookmarks] = useState<NovelBookmark[]>(() => [
    ...(props.initialBookmarks ?? []),
    ...(props.bookmarks ?? []),
  ]);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [readingSeconds, setReadingSeconds] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chapter = chapters[chapterIndex];
  const paragraphs = useMemo(() => paragraphsOf(chapter), [chapter]);
  const tokens: NovelThemeTokens = NOVEL_THEME_TOKENS[settings.theme as NovelThemeName] ?? NOVEL_THEME_TOKENS.day;

  // persistence
  useEffect(() => {
    if (!props.persist || !props.storageKey) return;
    const storage = getUPNovelStorage();
    const key = props.storageKey;
    Promise.resolve(storage.getItem(key))
      .then((raw) => {
        if (!raw) return;
        try {
          const saved = JSON.parse(raw) as { chapterIndex?: number; bookmarks?: NovelBookmark[]; seconds?: number };
          if (typeof saved.chapterIndex === 'number') setChapterIndex(saved.chapterIndex);
          if (Array.isArray(saved.bookmarks)) setBookmarks(saved.bookmarks);
          if (typeof saved.seconds === 'number') setReadingSeconds(saved.seconds);
        } catch {
          // ignore malformed persistence payload
        }
      })
      .catch(() => {});
  }, [props.storageKey]);

  useEffect(() => {
    if (!props.persist || !props.storageKey) return;
    const storage = getUPNovelStorage();
    const key = props.storageKey;
    const payload = JSON.stringify({ chapterIndex, bookmarks, seconds: readingSeconds });
    void Promise.resolve(storage.setItem(key, payload)).catch(() => {});
  }, [chapterIndex, bookmarks, readingSeconds]);

  // reading time
  useEffect(() => {
    const timer = setInterval(() => {
      setReadingSeconds((prev) => {
        const next = prev + 1;
        if (next % 60 === 0) input.onReadingTimeChange?.({ seconds: next, chapterIndex });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // prefetch neighbours
  useEffect(() => {
    const threshold = props.preloadThreshold ?? 2;
    for (let offset = 1; offset <= threshold; offset += 1) {
      if (chapterIndex + offset < chapters.length) input.onChapterPrefetch?.({ chapterIndex: chapterIndex + offset });
      if (chapterIndex - offset >= 0) input.onChapterPrefetch?.({ chapterIndex: chapterIndex - offset });
    }
  }, [chapterIndex]);

  useEffect(() => {
    input.onLayoutReady?.({ chapterIndex, paragraphs: paragraphs.length, pages: paragraphs.length });
  }, [chapterIndex, paragraphs.length]);

  const emitProgress = (next: NovelProgress) => {
    input.onProgressChange?.(next);
  };

  const gotoChapter = (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    const target = chapters[index];
    if (!target?.content) {
      input.onChapterRequest?.({ chapterIndex: index, chapter: target });
      if (props.error) input.onRetry?.({ chapterIndex: index });
    }
    setChapterIndex(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    emitProgress({ chapterIndex: index, paragraphIndex: 0, offset: 0 });
    setCatalogVisible(false);
    setSettingsVisible(false);
  };

  const showControls = () => {
    setControlsVisible(true);
    input.onToolbarChange?.({ visible: true });
    const autoHide = props.controlsAutoHide ?? 0;
    if (autoHide > 0) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setControlsVisible(false);
        input.onToolbarChange?.({ visible: false });
      }, autoHide * 1000);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const ratio = contentSize.height > layoutMeasurement.height ? contentOffset.y / Math.max(1, contentSize.height - layoutMeasurement.height) : 0;
    const paragraphIndex = Math.min(paragraphs.length - 1, Math.max(0, Math.round(ratio * paragraphs.length)));
    paragraphIndexRef.current = paragraphIndex;
    emitProgress({ chapterIndex, paragraphIndex, offset: contentOffset.y });
  };

  const toggleBookmark = () => {
    const target = paragraphIndexRef.current;
    const exists = bookmarks.some((b) => b.chapterIndex === chapterIndex && b.paragraphIndex === target);
    const next = exists
      ? bookmarks.filter((b) => !(b.chapterIndex === chapterIndex && b.paragraphIndex === target))
      : [
          ...bookmarks,
          { chapterIndex, paragraphIndex: target, text: paragraphs[target]?.slice(0, 40) ?? '', time: Date.now() },
        ];
    setBookmarks(next);
    input.onBookmarkChange?.(next);
  };

  const paragraphIndexRef = useRef(0);

  const updateSettings = (patch: Partial<NovelReaderSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    input.onSettingsChange?.(next);
  };

  const toggleMode = () => {
    const next = settings.animation ? (props.mode === 'page' ? 'scroll' : 'page') : 'scroll';
    input.onModeChange?.(next);
    setSettingsVisible(false);
  };

  const themeOptions: NovelThemeName[] = ['day', 'night', 'sepia'];

  return (
    <View style={[{ backgroundColor: tokens.background, flex: 1 }, input.customStyle]} testID="up-novel-reader">
      <ScrollView
        contentContainerStyle={{ paddingBottom: props.safeAreaInsetBottom ? 34 : 12, paddingHorizontal: 16, paddingTop: props.safeAreaInsetTop ? 44 : 12 }}
        onScroll={onScroll}
        ref={scrollRef}
        scrollEventThrottle={200}
        testID="up-novel-reader-content"
      >
        <Text style={{ color: tokens.text, fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
          {chapter?.title ?? `第 ${chapterIndex + 1} 章`}
        </Text>
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            onPress={showControls}
            style={{
              color: tokens.text,
              fontFamily: settings.fontFamily === 'system' ? undefined : settings.fontFamily,
              fontSize: settings.fontSize,
              fontWeight: settings.fontWeight as TextStyle['fontWeight'],
              lineHeight: settings.fontSize * settings.lineHeight,
              marginBottom: settings.paragraphSpacing,
            }}
            testID={`up-novel-reader-paragraph-${index}`}
          >
            {paragraph}
          </Text>
        ))}
        {!chapter?.content ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: tokens.muted, fontSize: 14 }}>{props.loading ? '加载中...' : '本章内容为空'}</Text>
            <Pressable
              onPress={() => input.onChapterRequest?.({ chapterIndex, chapter: chapter ?? {} })}
              style={{ backgroundColor: '#2979ff', borderRadius: 4, marginTop: 12, paddingHorizontal: 24, paddingVertical: 8 }}
              testID="up-novel-reader-retry"
            >
              <Text style={{ color: '#ffffff', fontSize: 14 }}>重新加载</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      {/* top controls */}
      {controlsVisible ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.75)',
            flexDirection: 'row',
            height: HEADER_HEIGHT,
            left: 0,
            paddingHorizontal: 10,
            position: 'absolute',
            right: 0,
            top: props.safeAreaInsetTop ? 44 : 0,
          }}
          testID="up-novel-reader-toolbar"
        >
          {props.showBack ? (
            <Pressable onPress={input.onBack} style={{ paddingHorizontal: 8 }} testID="up-novel-reader-back">
              <Text style={{ color: '#ffffff', fontSize: 18 }}>‹</Text>
            </Pressable>
          ) : null}
          <Text numberOfLines={1} style={{ color: '#ffffff', flex: 1, fontSize: 15, textAlign: 'center' }}>
            {chapter?.title ?? `第 ${chapterIndex + 1} 章`}
          </Text>
          <Pressable onPress={() => setCatalogVisible(true)} style={{ paddingHorizontal: 8 }} testID="up-novel-reader-catalog">
            <Text style={{ color: '#ffffff', fontSize: 14 }}>目录</Text>
          </Pressable>
          <Pressable onPress={() => setSettingsVisible(true)} style={{ paddingHorizontal: 8 }} testID="up-novel-reader-settings">
            <Text style={{ color: '#ffffff', fontSize: 14 }}>设置</Text>
          </Pressable>
          <Pressable onPress={toggleBookmark} style={{ paddingHorizontal: 8 }} testID="up-novel-reader-bookmark">
            <Text style={{ color: '#ffffff', fontSize: 14 }}>书签</Text>
          </Pressable>
          {input.toolbarExtraNode ? (
            <View
              style={{ alignItems: 'center', height: 36, justifyContent: 'center', width: 36 }}
              testID="up-novel-reader-toolbar-extra"
            >
              {input.toolbarExtraNode}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* bottom controls */}
      {controlsVisible ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.75)',
            bottom: props.safeAreaInsetBottom ? 34 : 0,
            flexDirection: 'row',
            height: FOOTER_HEIGHT,
            justifyContent: 'space-between',
            left: 0,
            paddingHorizontal: 16,
            position: 'absolute',
            right: 0,
          }}
          testID="up-novel-reader-footer"
        >
          <Pressable disabled={chapterIndex === 0} onPress={() => gotoChapter(chapterIndex - 1)} testID="up-novel-reader-prev">
            <Text style={{ color: chapterIndex === 0 ? '#666666' : '#ffffff', fontSize: 14 }}>上一章</Text>
          </Pressable>
          <Text style={{ color: '#ffffff', fontSize: 13 }} testID="up-novel-reader-progress">
            {chapterIndex + 1}/{chapters.length}
          </Text>
          <Pressable
            disabled={chapterIndex >= chapters.length - 1}
            onPress={() => gotoChapter(chapterIndex + 1)}
            testID="up-novel-reader-next"
          >
            <Text style={{ color: chapterIndex >= chapters.length - 1 ? '#666666' : '#ffffff', fontSize: 14 }}>下一章</Text>
          </Pressable>
        </View>
      ) : null}

      {/* catalog */}
      <UPPopup mode="left" onChangeShow={(next) => setCatalogVisible(next)} show={catalogVisible}>
        <View style={{ backgroundColor: tokens.background, height: '100%', padding: 16, width: 240 }}>
          <Text style={{ color: tokens.text, fontSize: 17, fontWeight: '700', marginBottom: 12 }}>目录</Text>
          <ScrollView>
            {chapters.map((item, index) => (
              <Pressable
                key={String(item.id ?? index)}
                onPress={() => gotoChapter(index)}
                style={{
                  backgroundColor: index === chapterIndex ? tokens.muted : 'transparent',
                  borderRadius: 4,
                  marginBottom: 4,
                  paddingVertical: 10,
                }}
                testID={`up-novel-reader-catalog-item-${index}`}
              >
                <Text style={{ color: index === chapterIndex ? '#ffffff' : tokens.text, fontSize: 14 }}>
                  {item.title ?? `第 ${index + 1} 章`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </UPPopup>

      {/* settings */}
      <UPPopup mode="bottom" onChangeShow={(next) => setSettingsVisible(next)} show={settingsVisible}>
        <View style={{ backgroundColor: tokens.background, padding: 16 }}>
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>阅读设置</Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 14 }}>
            <Text style={{ color: tokens.muted, fontSize: 14, marginRight: 10, width: 52 }}>主题</Text>
            {themeOptions.map((theme) => (
              <Pressable
                key={theme}
                onPress={() => updateSettings({ theme })}
                style={{
                  backgroundColor: settings.theme === theme ? '#2979ff' : tokens.muted,
                  borderRadius: 4,
                  marginRight: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
                testID={`up-novel-reader-theme-${theme}`}
              >
                <Text style={{ color: '#ffffff', fontSize: 13 }}>{theme}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 14 }}>
            <Text style={{ color: tokens.muted, fontSize: 14, marginRight: 10, width: 52 }}>字号</Text>
            <Pressable onPress={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })} style={{ paddingHorizontal: 10 }} testID="up-novel-reader-font-minus">
              <Text style={{ color: tokens.text, fontSize: 18 }}>−</Text>
            </Pressable>
            <Text style={{ color: tokens.text, fontSize: 14, minWidth: 40, textAlign: 'center' }}>{settings.fontSize}</Text>
            <Pressable onPress={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })} style={{ paddingHorizontal: 10 }} testID="up-novel-reader-font-plus">
              <Text style={{ color: tokens.text, fontSize: 18 }}>+</Text>
            </Pressable>
          </View>
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text style={{ color: tokens.muted, fontSize: 14, marginRight: 10, width: 52 }}>模式</Text>
            <Pressable onPress={toggleMode} style={{ backgroundColor: '#2979ff', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 6 }} testID="up-novel-reader-mode">
              <Text style={{ color: '#ffffff', fontSize: 13 }}>{props.mode === 'page' ? '分页' : '滚动'}</Text>
            </Pressable>
          </View>
        </View>
      </UPPopup>
    </View>
  );
}
