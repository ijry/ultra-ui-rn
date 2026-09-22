/**
 * ShortVideo 短视频切换
 * 严格复刻 uview-plus pages/componentsD/shortVideo/shortVideo.nvue
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  toast,
  UPIcon,
  UPShortVideo,
  UPTabbar,
  UPTabbarItem,
  type UPShortVideoItem,
} from 'ultra-ui-rn';
import { DemoPage, PropsTable } from '../_shared';

const PROPS = [
  {
    prop: 'tabsList',
    type: '{ name: string }[]',
    default: "[{name:'推荐'},{name:'关注'},{name:'朋友'},{name:'本地'}]",
    desc: '顶部分类标签',
  },
  { prop: 'videoList', type: 'UPShortVideoItem[]', default: '[]', desc: '视频数据列表' },
  { prop: 'currentTab', type: 'number', default: '0', desc: '当前分类下标' },
  { prop: 'currentVideo', type: 'number', default: '0', desc: '当前视频下标' },
  { prop: 'renderMenu', type: '() => ReactNode', default: '—', desc: '自定义菜单按钮（源 menu 插槽）' },
  { prop: 'renderSearch', type: '() => ReactNode', default: '—', desc: '自定义搜索按钮（源 search 插槽）' },
  {
    prop: 'renderVideo',
    type: '(item, index) => ReactNode',
    default: '—',
    desc: 'RN 原生接缝：注入 react-native-video 才能真正播放',
  },
  { prop: 'renderActions', type: '(item, index) => ReactNode', default: '—', desc: '自定义操作栏（源 actions 插槽）' },
  { prop: 'renderTabbar', type: '() => ReactNode', default: '—', desc: '底部标签栏（源 tabbar 插槽）' },
  { prop: 'customStyle', type: 'StyleProp<ViewStyle>', default: '—', desc: '根节点样式' },
  { prop: 'onTabChange', type: '(index: number) => void', default: '—', desc: '切换分类时触发' },
  { prop: 'onVideoChange', type: '(index: number) => void', default: '—', desc: '滑动切换视频时触发' },
  { prop: 'onLike', type: '(payload) => void', default: '—', desc: '点赞时触发' },
  { prop: 'onComment', type: '(payload) => void', default: '—', desc: '评论时触发' },
  { prop: 'onShare', type: '(payload) => void', default: '—', desc: '分享时触发' },
  { prop: 'onCollect', type: '(payload) => void', default: '—', desc: '收藏时触发' },
  { prop: 'onProgressChanging', type: '(payload) => void', default: '—', desc: '拖动进度条过程中触发' },
  { prop: 'onProgressChange', type: '(payload) => void', default: '—', desc: '进度条变更后触发' },
  { prop: 'onVideoPlay', type: '(payload) => void', default: '—', desc: '播放时触发' },
  { prop: 'onVideoPause', type: '(payload) => void', default: '—', desc: '暂停时触发' },
  { prop: 'onVideoEnded', type: '(payload) => void', default: '—', desc: '播放结束时触发' },
  { prop: 'onTimeUpdate', type: '(payload) => void', default: '—', desc: '播放进度更新时触发' },
  { prop: 'onLoadedMetadata', type: '(payload) => void', default: '—', desc: '视频元数据加载完成时触发' },
];

type ShortVideo = UPShortVideoItem & {
  author: { avatar: string; desc: string; name: string };
  bgColor: string;
  collectCount: number;
  commentCount: number;
  isCollected: boolean;
  isLiked: boolean;
  likeCount: number;
  progress: number;
  shareCount: number;
  videoUrl: string;
};

const TABS_LIST = [{ name: '推荐' }, { name: '关注' }, { name: '朋友' }, { name: '本地' }];

// 数据与源库逐字一致。bgColor 与 author 现由占位层消费（背景色 + 作者浮层）；
// videoUrl / progress 仍需 renderVideo 原生播放器接缝，属平台边界而非缺陷。
const VIDEO_LIST: ShortVideo[] = [
  {
    videoUrl: 'https://uview-plus.jiangruyi.com/big/rjtsdl.MP4',
    progress: 0,
    bgColor: '#000',
    author: {
      avatar: '/static/avatar1.jpg',
      name: '创作者1',
      desc: '这是一段视频描述',
    },
    isLiked: false,
    likeCount: 128,
    commentCount: 25,
    shareCount: 12,
    collectCount: 8,
    isCollected: false,
  },
  {
    videoUrl: 'https://uview-plus.jiangruyi.com/big/shanghai.mp4',
    progress: 0,
    bgColor: '#000',
    author: {
      avatar: '/static/avatar2.jpg',
      name: '创作者2',
      desc: '记录美好生活',
    },
    isLiked: true,
    likeCount: 863,
    commentCount: 96,
    shareCount: 32,
    collectCount: 45,
    isCollected: true,
  },
  {
    videoUrl: 'https://uview-plus.jiangruyi.com/big/shanghai.mp4',
    progress: 0,
    bgColor: '#000',
    author: {
      avatar: '/static/avatar3.jpg',
      name: '创作者3',
      desc: '生活需要仪式感',
    },
    isLiked: false,
    likeCount: 562,
    commentCount: 47,
    shareCount: 21,
    collectCount: 19,
    isCollected: false,
  },
];

export default function ShortVideoDemo() {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoList, setVideoList] = useState<ShortVideo[]>(VIDEO_LIST);

  const onTabChange = (index: number) => {
    console.log('切换tab到:', index);
    setCurrentTab(index);
  };

  const onVideoChange = (index: number) => {
    console.log('切换视频到:', index);
    setCurrentVideo(index);
  };

  const onLike = ({ index }: { index: number; item: UPShortVideoItem }) => {
    console.log('点赞视频:', index);
    // 更新点赞状态和数量
    setVideoList((prev) =>
      prev.map((video, i) =>
        i === index
          ? { ...video, isLiked: !video.isLiked, likeCount: video.likeCount + (video.isLiked ? -1 : 1) }
          : video,
      ),
    );
  };

  const onComment = ({ index }: { index: number; item: UPShortVideoItem }) => {
    console.log('评论视频:', index);
    toast.default('评论功能');
  };

  const onShare = ({ index }: { index: number; item: UPShortVideoItem }) => {
    console.log('分享视频:', index);
    toast.default('分享功能');
  };

  const onCollect = ({ index }: { index: number; item: UPShortVideoItem }) => {
    console.log('收藏视频:', index);
    // 更新收藏状态和数量
    setVideoList((prev) =>
      prev.map((video, i) =>
        i === index
          ? {
              ...video,
              collectCount: video.collectCount + (video.isCollected ? -1 : 1),
              isCollected: !video.isCollected,
            }
          : video,
      ),
    );
  };

  return (
    <>
      <View style={s.page}>
        <UPShortVideo
          currentTab={currentTab}
          currentVideo={currentVideo}
          onCollect={onCollect}
          onComment={onComment}
          onLike={onLike}
          onShare={onShare}
          onTabChange={onTabChange}
          onVideoChange={onVideoChange}
          renderActions={(item, index) => {
            const video = item as ShortVideo;
            // 自定义操作按钮
            return (
              <View style={s.customActions}>
                <Pressable onPress={() => onLike({ index, item })} style={s.actionItem}>
                  <UPIcon color="#eee" name={video.isLiked ? 'thumb-up-fill' : 'thumb-up'} size="32px" />
                  <Text style={s.actionText}>{video.likeCount}</Text>
                </Pressable>
                <Pressable onPress={() => onComment({ index, item })} style={s.actionItem}>
                  <UPIcon color="#eee" name="chat" size="32px" />
                  <Text style={s.actionText}>{video.commentCount}</Text>
                </Pressable>
                <Pressable onPress={() => onShare({ index, item })} style={s.actionItem}>
                  <UPIcon color="#eee" name="share" size="32px" />
                  <Text style={s.actionText}>{video.shareCount}</Text>
                </Pressable>
                <Pressable onPress={() => onCollect({ index, item })} style={s.actionItem}>
                  <UPIcon
                    color="#eee"
                    name={video.isCollected ? 'bookmark-fill' : 'bookmark'}
                    size="32px"
                  />
                  <Text style={s.actionText}>{video.collectCount}</Text>
                </Pressable>
              </View>
            );
          }}
          renderMenu={() => (
            // 自定义菜单按钮
            <View style={s.customMenu}>
              <UPIcon color="#ddd" name="grid" size="22px" />
            </View>
          )}
          renderSearch={() => (
            // 自定义搜索按钮
            <View style={s.customSearch}>
              <UPIcon color="#ddd" name="search" size="22px" />
            </View>
          )}
          renderTabbar={() => (
            <UPTabbar
              backgroundColor="rgba(255,255,255,0.05)"
              // 源库写 borderColor="rgba(255,255,255,0.25) !important"，RN 不支持 !important
              borderColor="rgba(255,255,255,0.25)"
              fixed
              placeholder
              safeAreaInsetBottom
            >
              {/* 源库首页项绑定 @click="goNext"，但该 demo 脚本里并未定义 goNext */}
              <UPTabbarItem icon="home" text="首页" />
              <UPTabbarItem icon="photo" text="放映厅" />
              <UPTabbarItem icon="play-right" text="直播" />
              <UPTabbarItem icon="account" text="我的" />
            </UPTabbar>
          )}
          tabsList={TABS_LIST}
          videoList={videoList}
        />
      </View>
      {/* 源库该页只有视频本体；Props 表是本仓库演示页的统一收尾 */}
      <DemoPage>
        <PropsTable rows={PROPS} />
      </DemoPage>
    </>
  );
}

const s = StyleSheet.create({
  actionItem: { alignItems: 'center', marginBottom: 20 },
  actionText: { color: '#fff', fontSize: 12, marginTop: 5 },
  // 缺失：UPShortVideo 不给 renderActions 包定位容器（源库组件内部有 .video-actions），故此处自行绝对定位
  customActions: { alignItems: 'center', bottom: 120, position: 'absolute', right: 12 },
  customMenu: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  customSearch: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  // 源库 .page { width: 100%; height: 100vh; background-color: #000 }；高度由 UPShortVideo 自带
  page: { backgroundColor: '#000', width: '100%' },
});
