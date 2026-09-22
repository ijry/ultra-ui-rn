import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';

export type UPShortVideoAuthor = { avatar?: string; name?: string; desc?: string };

export type UPShortVideoItem = Record<string, unknown> & {
  id?: string | number;
  title?: string;
  cover?: string;
  url?: string;
  /** Source per-video background (shortVideo.nvue:109); used by the placeholder. */
  bgColor?: string;
  /** Source creator block (shortVideo.nvue:110-114); shown as an overlay. */
  author?: UPShortVideoAuthor;
};

function bgColorOf(item: UPShortVideoItem): string {
  return typeof item.bgColor === 'string' && item.bgColor ? item.bgColor : '#1a1a1a';
}

function authorOf(item: UPShortVideoItem): UPShortVideoAuthor | null {
  const author = item.author;
  return author && typeof author === 'object' ? (author as UPShortVideoAuthor) : null;
}

export type UPShortVideoProps = {
  tabsList?: readonly { name: string }[];
  videoList?: readonly UPShortVideoItem[];
  currentTab?: number;
  currentVideo?: number;
  /** Source `menu` slot. */
  renderMenu?: () => React.ReactNode;
  /** Source `search` slot. */
  renderSearch?: () => React.ReactNode;
  /** Video player is a React Native boundary: inject `renderVideo` (e.g. react-native-video).
   *  Player events (onVideoPlay/onVideoPause/…) should be forwarded from the injected player. */
  renderVideo?: (item: UPShortVideoItem, index: number) => React.ReactNode;
  /** Source `actions` slot: replaces the right-side action rail per video. */
  renderActions?: (item: UPShortVideoItem, index: number) => React.ReactNode;
  /** Source `tabbar` slot: rendered pinned at the bottom of the pager. */
  renderTabbar?: () => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onTabChange?: (index: number) => void;
  onVideoChange?: (currentIndex: number) => void;
  onLike?: (payload: { item: UPShortVideoItem; index: number }) => void;
  onComment?: (payload: { item: UPShortVideoItem; index: number }) => void;
  onShare?: (payload: { item: UPShortVideoItem; index: number }) => void;
  onCollect?: (payload: { item: UPShortVideoItem; index: number }) => void;
  onProgressChanging?: (payload: { progress: number; index: number }) => void;
  onProgressChange?: (payload: { progress: number; index: number }) => void;
  onVideoPlay?: (payload: { index: number; event?: unknown }) => void;
  onVideoPause?: (payload: { index: number; event?: unknown }) => void;
  onVideoEnded?: (payload: { index: number; event?: unknown }) => void;
  onTimeUpdate?: (payload: { index: number; event?: unknown }) => void;
  onLoadedMetadata?: (payload: { index: number; event?: unknown }) => void;
};

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export function UPShortVideo(input: UPShortVideoProps): React.JSX.Element {
  const props = { ...useUPConfig().props.shortVideo, ...input } as UPShortVideoProps;
  const tabs = props.tabsList ?? [];
  const videos = props.videoList ?? [];
  const [tabIndex, setTabIndex] = useState(props.currentTab ?? 0);
  const [currentIndex, setCurrentIndex] = useState(props.currentVideo ?? 0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const switchTab = (index: number) => {
    setTabIndex(index);
    input.onTabChange?.(index);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.y / Math.max(1, event.nativeEvent.layoutMeasurement.height));
    if (next !== currentIndex && next >= 0 && next < videos.length) {
      setCurrentIndex(next);
      input.onVideoChange?.(next);
    }
  };

  const togglePlay = (index: number) => {
    if (playing) {
      setPlaying(false);
      input.onVideoPause?.({ index });
    } else {
      setPlaying(true);
      input.onVideoPlay?.({ index });
    }
  };

  const emitAction = (kind: 'like' | 'comment' | 'share' | 'collect', index: number) => {
    const payload = { item: videos[index], index };
    if (kind === 'like') input.onLike?.(payload);
    if (kind === 'comment') input.onComment?.(payload);
    if (kind === 'share') input.onShare?.(payload);
    if (kind === 'collect') input.onCollect?.(payload);
  };

  return (
    <View style={[{ backgroundColor: '#000000', height: WINDOW_HEIGHT }, input.customStyle]} testID="up-short-video">
      {/* header */}
      <View style={{ alignItems: 'center', flexDirection: 'row', paddingHorizontal: 12, paddingTop: 44, position: 'absolute', top: 0, zIndex: 10 }}>
        {props.renderMenu ? props.renderMenu() : (
          <View style={{ alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }} testID="up-short-video-menu">
            <Text style={{ color: '#ffffff', fontSize: 20 }}>▦</Text>
          </View>
        )}
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
          {tabs.map((tab, index) => (
            <Pressable key={String(tab.name)} onPress={() => switchTab(index)} style={{ paddingHorizontal: 14, paddingVertical: 10 }} testID={`up-short-video-tab-${index}`}>
              <Text style={{ color: tabIndex === index ? '#ffffff' : '#bbbbbb', fontSize: 16, fontWeight: tabIndex === index ? '600' : '400' }}>
                {tab.name}
              </Text>
            </Pressable>
          ))}
        </View>
        {props.renderSearch ? props.renderSearch() : (
          <View style={{ alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }} testID="up-short-video-search">
            <Text style={{ color: '#ffffff', fontSize: 20 }}>⌕</Text>
          </View>
        )}
      </View>

      {/* video pager */}
      <ScrollView
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        testID="up-short-video-pager"
      >
        {videos.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ height: WINDOW_HEIGHT, position: 'relative' }} testID={`up-short-video-item-${index}`}>
            {props.renderVideo ? (
              props.renderVideo(item, index)
            ) : (
              // The real video needs the renderVideo native seam; the placeholder
              // still honours the per-video bgColor and author block upstream
              // carries (shortVideo.nvue:109-114), which need no native player.
              <Pressable onPress={() => togglePlay(index)} style={{ alignItems: 'center', backgroundColor: bgColorOf(item), flex: 1, justifyContent: 'center' }} testID={`up-short-video-player-${index}`}>
                <Text style={{ color: '#ffffff', fontSize: 40 }}>{playing && currentIndex === index ? '⏸' : '▶'}</Text>
                <Text style={{ color: '#cccccc', fontSize: 14, marginTop: 10 }}>{String(item.title ?? `视频 ${index + 1}`)}</Text>
              </Pressable>
            )}
            {authorOf(item) ? (
              <View style={{ bottom: 120, left: 12, position: 'absolute', right: 90, zIndex: 5 }} testID={`up-short-video-author-${index}`}>
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>{`@${authorOf(item)!.name ?? ''}`}</Text>
                {authorOf(item)!.desc ? (
                  <Text numberOfLines={2} style={{ color: '#eeeeee', fontSize: 13, marginTop: 4 }}>{authorOf(item)!.desc}</Text>
                ) : null}
              </View>
            ) : null}
            {/* right action rail */}
            {props.renderActions?.(item, index) ?? (
              <View style={{ bottom: 120, position: 'absolute', right: 12, zIndex: 5 }}>
                {(['like', 'comment', 'share', 'collect'] as const).map((action) => (
                  <Pressable key={action} onPress={() => emitAction(action, index)} style={{ alignItems: 'center', marginBottom: 18 }} testID={`up-short-video-${action}-${index}`}>
                    <Text style={{ color: '#ffffff', fontSize: 26 }}>{action === 'like' ? '♥' : action === 'comment' ? '💬' : action === 'share' ? '↗' : '★'}</Text>
                    <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 2 }}>{action}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* bottom progress */}
      {videos.length > 0 ? (
        <View style={{ alignItems: 'center', bottom: 34, flexDirection: 'row', left: 0, paddingHorizontal: 12, position: 'absolute', right: 0 }}>
          <Pressable onPress={() => togglePlay(currentIndex)} style={{ marginRight: 10 }} testID="up-short-video-play-pause">
            <Text style={{ color: '#ffffff', fontSize: 18 }}>{playing ? '⏸' : '▶'}</Text>
          </Pressable>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, flex: 1, height: 4 }}>
            <View style={{ backgroundColor: '#ffffff', borderRadius: 2, height: 4, width: `${progress * 100}%` }} />
          </View>
          <Pressable
            onPress={() => {
              const next = Math.min(1, progress + 0.1);
              setProgress(next);
              input.onProgressChange?.({ progress: next, index: currentIndex });
            }}
            style={{ marginLeft: 10 }}
            testID="up-short-video-progress"
          >
            <Text style={{ color: '#ffffff', fontSize: 13 }}>+10%</Text>
          </Pressable>
        </View>
      ) : null}
      {props.renderTabbar?.()}
    </View>
  );
}
